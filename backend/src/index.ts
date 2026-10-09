import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";
import { WebSocketServer } from "ws";
import http from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto"



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const eventRooms = new Map<string, Set<import("ws").WebSocket>>();

interface AuthedRequest extends Request {
  userId?: number;
  userEmail?: string;
  userRole?: string;
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many login attempts, try again in 15minutes time." },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "Too many requests from this IP, slow down" },
    standardHeaders: true,
    legacyHeaders: false,
});

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
      role: string;
    };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
    if(req.userRole !== "admin") {
        return res.status(403).json({
            error: "Unauthorized - Admin Only"
        })
    }
    next();
}

function joinRoom(event_id: string, ws: import("ws").WebSocket) {
    if(!eventRooms.has(event_id)) {
        eventRooms.set(event_id, new Set());
    }
    eventRooms.get(event_id)!.add(ws);

}

function leaveRoom(event_id: string, ws: import("ws").WebSocket) {
    eventRooms.get(event_id)?.delete(ws)
}

function broadcastToEvent(event_id: string, message: object) {

    const room = eventRooms.get(event_id);
    if(!room) {
        console.log("No Room found for event: ", event_id);
        return;
    }

    console.log("Room found, size:", room.size)

    const payload = JSON.stringify(message);
    for (const client of room) {
        if(client.readyState === client.OPEN) {
            client.send(payload);
            console.log("sent message to client");
        } else {
            console.log("Skipped client - not open");
        }
    }
}

app.get("/events/:eventId/seats", async (req, res) => {
  const { eventId } = req.params;

  const result = await pool.query(
    "SELECT * FROM seats WHERE event_id = $1 ORDER BY label",
    [eventId]
  );

  res.json(result.rows);
});

app.get("/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events ORDER BY id");
  res.json(result.rows);
});

app.get("/bookings", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;

  try {
    const result = await pool.query(
      `SELECT s.id AS seat_id, s.label, e.id AS event_id, e.name AS event_name
       FROM seats s
       JOIN events e ON e.id = s.event_id
       WHERE s.held_by = $1 AND s.status = 'sold'
       ORDER BY e.name, s.label`,
      [userId.toString()]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/events", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const { name, rows, seatsPerRow } = req.body;

  if (!name || !rows || !seatsPerRow) {
    return res.status(400).json({ error: "name, rows, and seatsPerRow are required" });
  }

  if (rows > 26) {
    return res.status(400).json({ error: "Maximum 26 rows (A-Z) supported" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const eventResult = await client.query(
      "INSERT INTO events (name) VALUES ($1) RETURNING id, name",
      [name]
    );
    const event = eventResult.rows[0];

    await client.query(
      `INSERT INTO seats (event_id, label)
       SELECT $1, chr(65 + row) || num
       FROM generate_series(0, $2 - 1) AS row, generate_series(1, $3) AS num`,
      [event.id, rows, seatsPerRow]
    );

    await client.query("COMMIT");
    res.status(201).json({ event });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
});

app.post("/seats/:seatId/hold", requireAuth, generalApiLimiter, async (req: AuthedRequest, res) => {
    const { seatId } = req.params;
    const userId = req.userId!;
    

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const seatResult = await client.query(
            "SELECT * FROM seats WHERE id = $1 FOR UPDATE", [seatId]
        );
        const seat = seatResult.rows[0];

        if(!seat) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                error: "seat not found"
            })
        }

        if(seat.status !== "available") {
            await client.query("ROLLBACK");
            return res.status(409).json({
                error: "seat not available anymore"
            })
        }

        const heldUntil = new Date(Date.now() + 2 * 60 * 1000);
        await client.query(
            "UPDATE seats SET status = 'held', held_by = $1, held_until = $2 WHERE id = $3",
            [userId, heldUntil, seatId]
        );

        await client.query("COMMIT");
        broadcastToEvent(seat.event_id.toString(), {
            type: "seat_updated",
            seatId: seat.id,
            status: "held",
            heldUntil,
            heldBy: userId.toString()
        });
        res.json({ success: true, seatId, heldUntil, heldBy: userId.toString() });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({
            error: "something went wrong"
        });
    } finally {
        client.release()
    }
})

app.post("/seats/:seatId/cancel", requireAuth, generalApiLimiter, async (req:AuthedRequest, res) => {
    const { seatId } = req.params;
    const userId = req.userId!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const seatResult = await client.query(
            "SELECT * FROM seats WHERE id = $1 FOR UPDATE", [seatId]
        );
        const seat = seatResult.rows[0];

        if (!seat) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                error: "seat not found"
            });
        }

        if (seat.status !== "held" || seat.held_by !== userId.toString()) {
            await client.query("ROLLBACK");
            return res.status(403).json({
                error: "Seat not held by you"
            })
        }

        await client.query(
            "UPDATE seats SET status = 'available', held_by = null, held_until = null WHERE id = $1",
            [seatId]
        );

        await client.query("COMMIT");

        broadcastToEvent(seat.event_id.toString(), {
            type: 'seat_updated',
            seatId: seat.id,
            status: 'available',
            held_by: null,
            held_until: null
        });
        res.json({ success: true, seatId, status: 'available' });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({
           error: "something went wrong" 
        })
    } finally {
        client.release()
    }
})

app.post("/seats/:seatId/confirm", requireAuth, generalApiLimiter, async (req: AuthedRequest, res) => {
    const { seatId } = req.params;
    const userId = req.userId!;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const seatResult = await client.query(
            "SELECT * FROM seats WHERE id = $1 FOR UPDATE",
            [seatId]
        );

        const seat = seatResult.rows[0];

        if(!seat) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                error: "Seat not found"
            });
        };

        if(seat.status !== "held") {
            await client.query("ROLLBACK");
            return res.status(409).json({
                error: "seat not held by anyone"
            });
        }

        if(seat.held_by !== userId.toString()) {
            await client.query("ROLLBACK");
            return res.status(403).json({
                error: "This seat is held by someone else"
            });
        }

        if(new Date(seat.held_until) < new Date()) {
            await client.query("ROLLBACK");
            return res.status(410).json({
                error: "Hold has expired"
            })
        }

        await client.query(
            "UPDATE seats SET status = 'sold', held_until = NULL WHERE id = $1",
            [seatId]
        )

        await client.query("COMMIT");
        broadcastToEvent(seat.event_id.toString(), {
            type: 'seat_updated',
            seatId:seat.id,
            held_by: userId.toString(),
            status: 'sold'
        })
        res.json({ success: true, seatId, status: "sold", held_by: userId.toString()});
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({
            error: "something went wrong"
        });
    } finally {
        client.release()
    }
});

app.post("/auth/signup", async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.json(400).json({
            error: "Email or Password Required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: "Password must be at least 8 characters"
        })
    };

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, passwordHash]
        )

        res.status(201).json({
            user: result.rows[0]
        });
    } catch (err:any) {
       if (err.code === "23505") {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
        
    }
    
})

app.post("/auth/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, refreshToken, refreshExpiresAt]
    );

    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/auth/refresh", async(req, res) => {
    const { refreshToken } = req.body;

    if(!refreshToken) {
        return res.status(400).json({error: "Refresh token required"})
    }

    try {
        const result = await pool.query(
            `SELECT rt.user_id, rt.expires_at, u.email, u.role
            FROM refresh_tokens rt
            JOIN users u ON u.id = rt.user_id
            WHERE rt.token = $1`,
            [refreshToken]
        );
        const record = result.rows[0];

        if(!record) {
            return res.status(401).json({
                error:"Invalid or expired refresh token"
            });
        }

        if (new Date(record.expires_at) < new Date()) {
            await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
            return res.status(401).json({ error: "Refresh token expired" });
        }

        const newAccessToken = jwt.sign(
            { userId: record.user_id, email: record.email, role: record.role },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );

        res.json({ accessToken: newAccessToken });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.post("/auth/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
  }

  res.json({ success: true });
});

async function releaseExpiredHolds() {
    const result = await pool.query(
        `UPDATE seats
        SET status = 'available', held_by = NULL, held_until = NULL
        WHERE status = 'held' AND held_until < NOW()
        RETURNING id, event_id`
    )

    if(result.rowCount && result.rowCount > 0) {
        console.log(`Released ${result.rowCount} expired hold(s)`)

        for (const seat  of result.rows) {
            broadcastToEvent(seat.event_id.toString(), {
                type: "seat_updated",
                seatId: seat.id,
                status: "available"
            })
        }
    }
}

setInterval(releaseExpiredHolds, 15000);  // check for expired holds every 15seconds

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log('New WebSocket connection');
    let currentEventId: string | null = null;

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === "join"  && typeof data.eventId === "string") {
            currentEventId = data.eventId;
            joinRoom(data.eventId, ws);
            console.log(`Client joined event ${currentEventId}`);
        }
    });

    ws.on("close", () => {
        if(currentEventId) {    
            leaveRoom(currentEventId, ws);
        }
        console.log("Connection cosed");
    });
});

const broken: number = "this is not a number";

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));