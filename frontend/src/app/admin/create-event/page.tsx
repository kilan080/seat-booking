"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { useCreateEvent } from "@/hooks/use-events";

type TierInput = { rows: number; price: number };

export default function CreateEventPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const createEventMutation = useCreateEvent();

  const [name, setName] = useState("");
  const [rows, setRows] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [tiers, setTiers] = useState<TierInput[]>([{ rows: 5, price: 50 }]);

  function updateTier(index: number, field: keyof TierInput, value: number) {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  }
  function addTier() {
    setTiers((prev) => [...prev, { rows: 1, price: 0 }]);
  }
  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  const assignedRows = tiers.reduce((sum, t) => sum + t.rows, 0);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#17171B] text-[#E9E9EC] flex items-center justify-center px-4">
        <p className="text-sm text-[#9A9AA2]">
          You don&apos;t have access to this page.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Event name is required!");
      return;
    }

    if (rows < 1 || rows > 26) {
      toast.error("Rows must be between 1 and 26 (A to Z)");
      return;
    }

    if (seatsPerRow < 1 || seatsPerRow > 100) {
      toast.error("Seats per row must be between 1 and 100");
      return;
    }

    // NEW: every tier needs a whole number of rows (at least 1) and a valid price
    if (tiers.some((t) => !Number.isInteger(t.rows) || t.rows < 1)) {
      toast.error("Each tier needs at least 1 row");
      return;
    }
    if (tiers.some((t) => Number.isNaN(t.price) || t.price < 0)) {
      toast.error("Prices can't be negative");
      return;
    }

    // NEW: tiers must cover exactly the rows the event has
    if (assignedRows !== rows) {
      toast.error(
        `Tiers cover ${assignedRows} of ${rows} rows. They must match.`,
      );
      return;
    }

    // NEW: convert money units (50.00) to minor units (5000) for the API
    const tiersPayload = tiers.map((t) => ({
      rows: t.rows,
      priceCents: Math.round(t.price * 100),
    }));

    const toastId = toast.loading("Creating event...");

    try {
      const result = await createEventMutation.mutateAsync({
        name,
        rows,
        seatsPerRow,
        tiers: tiersPayload,
      });
      toast.dismiss(toastId);
      router.push(`/events/${result.event.id}`);
    } catch {
      toast.dismiss(toastId);
    }
  }

  return (
    <div className="min-h-screen bg-[#17171B] text-[#E9E9EC] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1E1E23] border border-white/10 rounded-lg p-8 shadow-2xl"
      >
        <h1 className="text-xl font-medium text-center mb-6">Create Event</h1>

        <div className="mb-4">
          <label className="block text-xs text-[#9A9AA2] mb-1">
            Event Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (!name.trim()) {
                toast.error("Event name cannot be empty", {
                  id: "input-name-err",
                });
              }
            }}
            required
            placeholder="e.g. Summer Music Festival"
            className="w-full px-3 py-2 rounded bg-[#17171B] border border-white/10 text-sm focus:outline-none focus:border-[#E8A33D]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-[#9A9AA2] mb-1">
            Rows (1 to 26 - A, B, C...)
          </label>
          <input
            type="number"
            min={1}
            max={26}
            value={rows}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > 26) {
                toast.error("Maximum 26 rows allowed (A-Z)", {
                  id: "rows-limit",
                });
              } else if (val < 1 && e.target.value !== "") {
                toast.error("Minimum 1 row required", { id: "rows-limit" });
              }
              setRows(val);
            }}
            required
            className="w-full px-3 py-2 rounded bg-[#17171B] border border-white/10 text-sm focus:outline-none focus:border-[#E8A33D]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-[#9A9AA2] mb-1">
            Seats per Row
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={seatsPerRow}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val < 1 && e.target.value !== "") {
                toast.error("Minimum 1 seat per row required", {
                  id: "seats-limit",
                });
              }
              setSeatsPerRow(val);
            }}
            required
            className="w-full px-3 py-2 rounded bg-[#17171B] border border-white/10 text-sm focus:outline-none focus:border-[#E8A33D]"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-[#9A9AA2]">
              Pricing tiers (front rows first)
            </label>
            <span
              className={`text-xs ${assignedRows === rows ? "text-[#3E8E63]" : "text-[#E8A33D]"}`}
            >
              {assignedRows} of {rows} rows
            </span>
          </div>

          <div className="flex gap-2 mb-1 text-[10px] text-[#9A9AA2]">
            <span className="w-1/2">Rows in tier</span>
            <span className="w-1/2">Price per seat</span>
          </div>

          {tiers.map((tier, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="number"
                min={1}
                value={tier.rows}
                onChange={(e) =>
                  updateTier(index, "rows", Number(e.target.value))
                }
                aria-label="Rows in tier"
                className="w-1/2 px-3 py-2 rounded bg-[#17171B] border border-white/10 text-sm focus:outline-none focus:border-[#E8A33D]"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={tier.price}
                onChange={(e) =>
                  updateTier(index, "price", Number(e.target.value))
                }
                aria-label="Price per seat"
                className="w-1/2 px-3 py-2 rounded bg-[#17171B] border border-white/10 text-sm focus:outline-none focus:border-[#E8A33D]"
              />
              {tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  aria-label="Remove tier"
                  className="text-xs text-red-400 px-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTier}
            className="text-xs text-[#E8A33D] hover:underline"
          >
            + Add tier
          </button>
        </div>

        <button
          type="submit"
          disabled={createEventMutation.isPending}
          className="w-full py-2 rounded bg-[#3E8E63] hover:bg-[#4CA876] font-medium text-sm disabled:opacity-50 cursor-pointer transition-colors"
        >
          {createEventMutation.isPending ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
