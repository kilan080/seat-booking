"use client";

import { useEffect, useState } from "react";

type Seat = {
  id: number;
  event_id: number;
  label: string;
  status: "available" | "held" | "sold";
  held_by: string | null;
  held_until: string | null;
};

const CURRENT_USER = "job";

export default function SeatMap({ eventId }: { eventId: string }) {
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    async function fetchSeats() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/seats`,
      );
      const data = await res.json();
      setSeats(data);
    }

    fetchSeats();
  }, [eventId]);

  useEffect(() => {
    return () => {
      socket.close();
    };
  }, [eventId]);

  async function seatClick(seat: Seat) {
    if (seat.status !== "available") return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/seats/${seat.id}/hold`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: CURRENT_USER }),
      },
    );

    if (res.ok) {
      setSeats((prev) =>
        prev.map((s) => (s.id === seat.id ? { ...s, status: "held" } : s)),
      );
    } else {
      const data = await res.json();
      alert(data.error || "Could not hold seat");
    }
  }

  return (
    <div className="grid grid-cols-10 gap-2 p-6">
      {seats.map((seat) => (
        <button
          onClick={() => seatClick(seat)}
          disabled={seat.status !== "available"}
          key={seat.id}
          className={`h-10 w-10 flex items-center justify-center rounded text-xs font-medium text-white ${
            seat.status === "available"
              ? "bg-green-500 hover:bg-green-400 cursor-pointer"
              : seat.status === "held"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 cursor-not-allowed"
          }`}
        >
          {seat.label}
        </button>
      ))}
    </div>
  );
}
