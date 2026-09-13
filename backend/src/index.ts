import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";
import { WebSocketServer } from "ws";
import http from "http";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const eventRooms = new Map<string, Set<import("ws").WebSocket>>();

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
    console.log("Attempting broadcast to room:", event_id);
    console.log("Known rooms:", Array.from(eventRooms.keys()));

    const room = eventRooms.get(event_id);
    if(!room) {
        console.log("No Room found for event: ", event_id);
        return;
    }

    console.log("Room found, size:", room.size)

    const payload = JSON.stringify(message);
    for (const client of room) {
        console.log("Client readyState:", client.readyState, "OPEN is:", client.OPEN);
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

app.post("/seats/:seatId/hold", async (req, res) =>{
    const { seatId } = req.params;
    const { userId } = req.body;

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
            type:"seat_updated",
            seatId: seat.id,
            status: "held"
        });
        res.json({ success: true, seatId, heldUntil });
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

app.post("/seats/:seatId/confirm", async (req, res) => {
    const { seatId } = req.params;
    const { userId } = req.body;

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

        if(seat.held_by !== userId) {
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
        res.json({ success: true, seatId, status: "sold"});
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

async function releaseExpiredHolds() {
    const result = await pool.query(
        `UPDATE seats
        SET status = 'available', held_by = NULL, held_until = NULL
        WHERE status = 'held' AND held_until < NOW()`
    )

    if(result.rowCount && result.rowCount > 0) {
        console.log(`Released ${result.rowCount} expired hold(s)`)
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