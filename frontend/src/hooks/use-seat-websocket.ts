import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Seat } from "@/lib/types";

export function useSeatWebSocket(eventId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", eventId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "seat_updated") {
        queryClient.setQueryData<Seat[]>(["seats", eventId], (prev) => {
          if (!prev) return prev;
          return prev.map((s) =>
            s.id === data.seatId
              ? { ...s, status: data.status, held_until: data.heldUntil ?? null, held_by: data.heldBy ?? null }
              : s
          );
        });
      }
    };

    return () => socket.close();
  }, [eventId, queryClient]);
}