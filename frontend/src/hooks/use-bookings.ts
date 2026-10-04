import { useQuery } from "@tanstack/react-query";
import { fetchMyBookings } from "@/lib/api";

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: fetchMyBookings,
  });
}