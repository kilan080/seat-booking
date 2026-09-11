CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  held_by TEXT,
  held_until TIMESTAMPTZ,
  UNIQUE(event_id, label)
);

INSERT INTO events (name) VALUES ('Test Concert');

INSERT INTO seats (event_id, label)
SELECT 1, chr(65 + row) || num
FROM generate_series(0, 4) AS row, generate_series(1, 10) AS num;