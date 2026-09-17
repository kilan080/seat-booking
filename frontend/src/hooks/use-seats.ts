import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSeats, holdSeat } from "@/lib/api";
import type { Seat } from "@/lib/types";

const CURRENT_USER = "ola";

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

  return useMutation({
    mutationFn: (seatId: number) => holdSeat(seatId, CURRENT_USER),

    onSuccess: (data) => {
      queryClient.setQueryData<Seat[]>(["seats", eventId], (prev) =>
        prev?.map((s) =>
          s.id === data.seatId
            ? { ...s, status: "held" as const, held_until: data.heldUntil }
            : s,
        ),
      );
    },

    onError: (error: Error) => {
      alert(error.message);
    },
  });
}
