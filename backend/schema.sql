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
  price_cents INTEGER NOT NULL DEFAULT 0,
  UNIQUE(event_id, label)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO events (name) VALUES ('Test Concert');

INSERT INTO seats (event_id, label, price_cents)
SELECT 1, chr(65 + row) || num, CASE WHEN row < 2 THEN 10000 ELSE 5000 END
FROM generate_series(0, 4) AS row, generate_series(1, 10) AS num;