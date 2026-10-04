"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useMyBookings } from "@/hooks/use-bookings";

export default function BookingsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: bookings, isLoading, error } = useMyBookings();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#17171B] text-[#E9E9EC] flex items-center justify-center px-4">
        <p className="text-sm text-[#9A9AA2]">
          Please{" "}
          <Link href="/login" className="text-[#E8A33D] hover:underline">
            log in
          </Link>{" "}
          to see your bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#17171B] text-[#E9E9EC] flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-[#9A9AA2] hover:text-[#E9E9EC] transition-colors mb-6"
        >
          ← Back to events
        </Link>

        <h1 className="text-center text-sm tracking-[0.15em] text-[#9A9AA2] mb-1">
          my bookings
        </h1>
        <h2 className="text-center text-xl sm:text-2xl font-medium mb-10">
          {user.email}
        </h2>

        {isLoading && (
          <p className="text-center text-sm text-[#9A9AA2]">Loading...</p>
        )}

        {error && (
          <p className="text-center text-sm text-red-400">
            Could not load your bookings.
          </p>
        )}

        {bookings && bookings.length === 0 && (
          <p className="text-center text-sm text-[#9A9AA2]">
            You haven&apos;t booked any seats yet.
          </p>
        )}

        {bookings && bookings.length > 0 && (
          <ul className="space-y-3">
            {bookings.map((booking) => (
              <li
                key={booking.seat_id}
                className="flex justify-between items-center bg-[#1E1E23] border border-white/10 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{booking.event_name}</p>
                  <p className="text-xs text-[#9A9AA2]">Seat {booking.label}</p>
                </div>
                <Link
                  href={`/events/${booking.event_id}`}
                  className="text-xs text-[#E8A33D] hover:underline"
                >
                  View event
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
