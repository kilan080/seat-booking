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
  token: string
): Promise<{
  heldBy: string | null; success: boolean; seatId: number; heldUntil: string 
}> {
  const res = await fetch(`${API_URL}/seats/${seatId}/hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Could not hold seat");
  }

  return data;
}

export async function signup(
  email: string,
  password: string
): Promise<{ user: { id: number; email: string } }> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Could not sign up");
  }

  return res.json();
}

export async function login (email: string, password: string):Promise<{ token: string; user: { id: number, email: string } }> {
  const res = await fetch(`${API_URL}/auth/login`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if(!res.ok) {
    const data = await res.json();
    throw new Error(data.error  || "Could not lofin");
  }

  return res.json();
}


export async function confirmSeat(
  seatId: number,
  userId: string,
  token: string
): Promise<{ success: boolean; seatId: number; status: string }> {
  const res = await fetch(`${API_URL}/seats/${seatId}/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Could not confirm seat");
  }

  return res.json();
}