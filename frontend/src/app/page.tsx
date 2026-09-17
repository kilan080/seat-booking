"use client";

import Link from "next/link";
import { useEvents } from "@/hooks/use-events";

export default function Home() {
  const { data: events = [], isLoading, isError } = useEvents();

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
        <p className="text-[#9A9AA2]">Loading events…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
        <p className="text-red-400">Failed to load events.</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="text-blue-600 hover:underline"
            >
              {event.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
