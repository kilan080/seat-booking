import type { Event, Seat } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${API_URL}/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchSeats(eventId: string): Promise<Seat[]> {
  const res = await fetch(`${API_URL}/events/${eventId}/seats`);
  if (!res.ok) throw new Error("Failed to fetch seats");
  return res.json();
}

export async function holdSeat(
  seatId: number,
  userId: string,
): Promise<{ success: boolean; seatId: number; heldUntil: string }> {
  const res = await fetch(`${API_URL}/seats/${seatId}/hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Could not hold seat");
  }

  return data;
}
