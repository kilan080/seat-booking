"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSeats, useHoldSeat, useConfirmSeat } from "@/hooks/use-seats";
import { useSeatWebSocket } from "@/hooks/use-seat-websocket";
import { Seat } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

const ROW_ORDER = ["A", "B", "C", "D", "E"];

export default function SeatMap({ eventId }: { eventId: string }) {
  const { data: seats = [] } = useSeats(eventId);
  const holdMutation = useHoldSeat(eventId);
  const user = useAuthStore((state) => state.user);
  useSeatWebSocket(eventId);
  const confirmMutation = useConfirmSeat(eventId);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  function handleSeatClick(seat: Seat) {
    if (seat.status !== "available") return;
    if (!user) {
      alert("Please log in to hold a seat!");
      return;
    }
    holdMutation.mutate({ seatId: seat.id, userId: user.email });
  }

  const seatsByRow = ROW_ORDER.map((row) => ({
    row,
    seats: seats
      .filter((s) => s.label.startsWith(row))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true }),
      ),
  })).filter((r) => r.seats.length > 0);

  function formatCountdown(heldUntil: string) {
    const secondsLeft = Math.max(
      0,
      Math.floor((new Date(heldUntil).getTime() - now) / 1000),
    );
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const statusStyles: Record<Seat["status"], string> = {
    available:
      "bg-[#3E8E63] hover:bg-[#4CA876] focus-visible:outline-[#E8A33D]",
    held: "bg-[#5B5E66] cursor-not-allowed opacity-70",
    sold: "bg-[#B4463F] cursor-not-allowed opacity-70",
  };

  function handleConfirmClick(seat: Seat) {
    if (!user) return;
    confirmMutation.mutate({ seatId: seat.id, userId: user.email });
  }

  return (
    <div className="min-h-screen bg-[#17171B] text-[#E9E9EC] flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-[#9A9AA2] hover:text-[#E9E9EC] transition-colors"
          >
            ← Back to events
          </Link>
          {user ? (
            <span className="text-xs text-[#9A9AA2]">{user.email}</span>
          ) : (
            <Link
              href="/login"
              className="text-xs text-[#E8A33D] hover:underline"
            >
              Log in
            </Link>
          )}
        </div>

        <h1 className="text-center text-sm tracking-[0.15em] text-[#9A9AA2] mb-1">
          seat selection
        </h1>
        <h2 className="text-center text-xl sm:text-2xl font-medium mb-10">
          Event {eventId}
        </h2>

        <div className="mb-10 flex flex-col items-center">
          <div
            className="w-3/4 h-2 rounded-full bg-linear-to-r from-transparent via-[#E8A33D]/70 to-transparent"
            aria-hidden
          />
          <span className="mt-2 text-xs tracking-[0.2em] text-[#9A9AA2]">
            stage
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          {seatsByRow.map(({ row, seats: rowSeats }) => (
            <div key={row} className="flex items-center gap-2 sm:gap-3">
              <span className="w-4 shrink-0 text-xs text-[#9A9AA2] text-right">
                {row}
              </span>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 flex-1">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status !== "available"}
                    title={`${seat.label} — ${seat.status}`}
                    className={`flex items-center justify-center rounded-md text-[10px] sm:text-xs font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${statusStyles[seat.status]}`}
                    style={{
                      width: "clamp(22px, 6.2vw, 34px)",
                      height: "clamp(22px, 6.2vw, 34px)",
                    }}
                  >
                    {seat.label.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-6 text-xs text-[#9A9AA2]">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#3E8E63]" /> Available
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#5B5E66]" /> Held
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#B4463F]" /> Sold
          </span>
        </div>

        {seats.some((s) => s.status === "held" && s.held_until) && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-xs tracking-[0.15em] text-[#9A9AA2] mb-3">
              currently held
            </h3>
            <ul className="space-y-1.5 text-sm">
              {seats
                .filter((s) => s.status === "held" && s.held_until)
                .map((s) => {
                  const isMine = user && String(user.id) === s.held_by;
                  return (
                    <li
                      key={s.id}
                      className="flex justify-between items-center text-[#C7C7CE]"
                    >
                      <span>Seat {s.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="tabular-nums text-[#E8A33D]">
                          {formatCountdown(s.held_until!)}
                        </span>
                        {isMine && (
                          <button
                            onClick={() => handleConfirmClick(s)}
                            disabled={confirmMutation.isPending}
                            className="text-xs px-2 py-1 rounded bg-[#3E8E63] hover:bg-[#4CA876] disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
