import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmSeat, fetchSeats, holdSeat } from "@/lib/api";
import type { Seat } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";


/**
 * Fetches seats for an event via React Query.
 * Components read seats directly from the returned `data`.
 */
export function useSeats(eventId: string) {
  return useQuery({
    queryKey: ["seats", eventId],
    queryFn: () => fetchSeats(eventId),
  });
}

/**
 * Mutation hook for holding a seat. On success, patches the
 * React Query cache directly for immediate UI feedback.
 */

export function useHoldSeat(eventId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: ({ seatId, userId }: { seatId: number; userId: string }) =>
      holdSeat(seatId, userId, token!),

    onSuccess: (data) => {
      queryClient.setQueryData<Seat[]>(["seats", eventId], (prev) => {
        if (!prev) return prev;
        return prev.map((s) =>
          s.id === data.seatId
            ? { ...s, status: "held", held_until: data.heldUntil, held_by: data.heldBy, }
            : s
        );
      });
    },

    onError: (error) => {
      alert(error.message || "Could not hold seat");
    },
  });
}

export function useConfirmSeat(eventId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: ({ seatId, userId }: { seatId: number; userId: string }) =>
      confirmSeat(seatId, userId, token!),

    onSuccess: (data) => {
      queryClient.setQueryData<Seat[]>(["seats", eventId], (prev) => {
        if (!prev) return prev;
        return prev.map((s) =>
          s.id === data.seatId ? { ...s, status: "sold", held_until: null } : s
        );
      });
    },

    onError: (error) => {
      alert(error.message || "Could not confirm seat");
    },
  });
}
