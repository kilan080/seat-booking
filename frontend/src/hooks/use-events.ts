import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchEvents, createEvent } from "@/lib/api";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, rows, seatsPerRow }: { name: string; rows: number; seatsPerRow: number }) =>
      createEvent(name, rows, seatsPerRow),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
    },

    onError: (error) => {
      toast.error(error.message || "Could not create event");
    },
  });
}