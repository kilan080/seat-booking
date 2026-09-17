export type Event = {
  id: number;
  name: string;
};

export type Seat = {
  id: number;
  event_id: number;
  label: string;
  status: "available" | "held" | "sold";
  held_by: string | null;
  held_until: string | null;
};
