import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "@/lib/api";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
}
