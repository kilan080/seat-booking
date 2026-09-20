import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";
import { WebSocketServer } from "ws";
import http from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const eventRooms = new Map<string, Set<import("ws").WebSocket>>();

interface AuthedRequest extends Request {
  userId?: number;
  userEmail?: string;
}

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
    };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
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

app.post("/seats/:seatId/hold", requireAuth, async (req: AuthedRequest, res) => {
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

app.post("/seats/:seatId/confirm", requireAuth, async (req: AuthedRequest, res) => {
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

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
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

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
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


const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));