import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));