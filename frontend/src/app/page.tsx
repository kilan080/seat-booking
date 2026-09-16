"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = { id: number; name: string };

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);
      const data = await res.json();
      setEvents(data);
    }
    fetchEvents();
  }, []);

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
