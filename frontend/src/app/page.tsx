import SeatMap from "@/components/SeatMap";

export default function Home() {
  return (
    <main>
      <h1 className="text-2xl font-bold p-6">Test Concert — Seat Map</h1>
      <SeatMap eventId="1" />
    </main>
  );
}
