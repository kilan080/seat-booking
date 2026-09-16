import SeatMap from "@/components/SeatMap";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <SeatMap eventId={eventId} />;
}
