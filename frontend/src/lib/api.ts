import type { Event, Seat } from "./types";
import { fetchWithAuth } from "./fetchWithAuth";

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

export async function holdSeat(seatId: number, userId: string) {
  const res = await fetchWithAuth(`${API_URL}/seats/${seatId}/hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Could not hold seat");
  }

  return res.json();
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

export async function login(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; user: { id: number; email: string; role: string } }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Could not login");
  }

  return res.json();
}


export async function confirmSeat(
  seatId: number,
  userId: string
): Promise<{ success: boolean; seatId: number; status: string }> {
  const res = await fetchWithAuth(`${API_URL}/seats/${seatId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Could not confirm seat");
  }

  return res.json();
}

export async function cancelSeat(
  seatId: number,
  userId: string
): Promise<{ success: boolean; seatId: number; status: string }> {
  const res = await fetchWithAuth(`${API_URL}/seats/${seatId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Could not cancel seat");
  }

  return res.json();
}

export async function createEvent(
  name: string,
  rows: number,
  seatsPerRow: number
): Promise<{ event: { id: number; name: string } }> {
  const res = await fetchWithAuth(`${API_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, rows, seatsPerRow }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Could not create event");
  }

  return res.json();
}