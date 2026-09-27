import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchEvents, createEvent } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: ({ name, rows, seatsPerRow }: { name: string; rows: number; seatsPerRow: number }) =>
      createEvent(name, rows, seatsPerRow, token!),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
    },

    onError: (error) => {
      toast.error(error.message || "Could not create event");
    },
  });
}