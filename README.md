# 🎟️ SeatSpot — Real-Time Event Seat Reservation System

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Express-5.2-green?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![WebSockets](https://img.shields.io/badge/WebSockets-ws-red)

A full-stack, enterprise-grade real-time seat reservation platform designed to handle high-concurrency ticket sales without double-bookings. Built with **Next.js 16**, **Express**, **PostgreSQL**, **WebSockets**, **TanStack React Query**, and **Zustand**.

---

## 🚀 Features & Highlights

- ⚡ **Real-Time WebSocket Synchronization**: Live seat status updates (Available, Held, Sold) broadcast immediately to all connected clients in an event room.
- 🔒 **Race-Condition & Concurrency Protection**: Atomic PostgreSQL database transactions with row-level locks (`SELECT ... FOR UPDATE`) guarantee zero double-bookings under concurrent hold attempts.
- ⏱️ **Timed Seat Holds & Auto-Release**: 2-minute temporary seat reservations for checking out. An automated backend cleanup task runs every 15 seconds to release expired holds and notify clients via WebSockets.
- 🔑 **Robust Authentication & Refresh Tokens**: Short-lived JWT Access Tokens (15 min) paired with persistent Refresh Tokens (7 days stored in DB).
- 🛡️ **Rate Limiting & Security**: Protection against brute-force login attempts (5 attempts per 15 mins) and general API spam using `express-rate-limit`.
- 👑 **Admin Event Creation**: Role-based access control (`admin` vs `user`) allowing admins to create events with custom row/seat grids (up to 26 rows A–Z and custom seats per row).
- 🎨 **Modern Dark-Mode UI**: Designed with Tailwind CSS v4, Lucide React icons, and `react-hot-toast` notifications.
- 🐳 **Dockerized Setup**: Containerized setup via `docker-compose` for quick setup of PostgreSQL and the Node.js backend service.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Tailwind CSS v4, Lucide Icons, `@tanstack/react-query`, `zustand` (persist), `react-hot-toast` |
| **Backend** | Node.js, Express 5, TypeScript | `ws` (WebSockets), `pg` (PostgreSQL Client), `jsonwebtoken`, `bcrypt`, `express-rate-limit` |
| **Database** | PostgreSQL 16 | Relational schema with Foreign Keys, Unique Constraints, Transaction locks |
| **DevOps** | Docker & Docker Compose | Multi-stage build, containerized PostgreSQL 16 instance |

---

## 📁 Project Structure

```
seat-booking/
├── backend/
│   ├── src/
│   │   ├── db.ts               # PostgreSQL connection pool configuration
│   │   └── index.ts            # Express REST API, WebSocket server & background hold cleanup
│   ├── schema.sql              # Database schema tables & seed data
│   ├── test-concurrency.js     # Script to simulate concurrent seat hold requests
│   ├── Dockerfile              # Docker container configuration for Node backend
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router (Landing, Admin, Login, Events)
│   │   ├── components/         # Reusable UI components (SeatMap)
│   │   ├── hooks/              # Custom React hooks (useSeats, useEvents, useSeatWebSocket)
│   │   ├── lib/                # API client, fetchWithAuth interceptor, TypeScript interfaces
│   │   └── store/              # Zustand authentication store with local storage persistence
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml          # Docker composition for database & backend services
└── README.md
```

---

## 📊 Database Schema

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'held' | 'sold'
  held_by TEXT,
  held_until TIMESTAMPTZ,
  UNIQUE(event_id, label)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',        -- 'user' | 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔗 REST API & WebSocket Protocol

### 🔓 Authentication Endpoints
- `POST /auth/signup` — Create a new user account (`email`, `password`).
- `POST /auth/login` — Authenticate and receive `accessToken`, `refreshToken`, and user payload. *(Rate limited to 5 attempts per 15 minutes)*.
- `POST /auth/refresh` — Exchange a valid `refreshToken` for a fresh `accessToken`.
- `POST /auth/logout` — Invalidate and remove a `refreshToken`.

### 🎟️ Event Endpoints
- `GET /events` — Retrieve all upcoming events.
- `GET /events/:eventId/seats` — Retrieve all seats and current statuses for a specific event.
- `POST /events` — *(Admin Only)* Create a new event and auto-generate seat rows (`name`, `rows`, `seatsPerRow`).

### 💺 Seat Management Endpoints *(Require Authentication)*
- `POST /seats/:seatId/hold` — Request a 2-minute temporary hold on an available seat.
- `POST /seats/:seatId/cancel` — Cancel an active seat hold owned by the current user.
- `POST /seats/:seatId/confirm` — Permanently confirm purchase of a held seat.

### 📡 WebSocket Protocol
- **Endpoint**: `ws://localhost:4000`
- **Join Event Room**: Send `{"type": "join", "eventId": "<eventId>"}`
- **Server Broadcast Payload**:
  ```json
  {
    "type": "seat_updated",
    "seatId": 12,
    "status": "held",
    "heldUntil": "2026-10-01T16:00:00.000Z",
    "heldBy": "3"
  }
  ```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **npm** or **yarn** or **pnpm**
- **PostgreSQL**: v14+ OR **Docker & Docker Compose**

---

### Method 1: Running with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/seat-booking.git
   cd seat-booking
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory or inside `backend/` and `frontend/`:
   
   **Backend (`backend/.env`)**:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://seatbooking:devpassword@localhost:5432/seatbooking
   JWT_SECRET=super_secret_jwt_key_change_in_production
   ```

   **Frontend (`frontend/.env.local`)**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_WS_URL=ws://localhost:4000
   ```

3. **Start services with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

---

### Method 2: Manual Local Setup

#### 1. Setup Database
Ensure PostgreSQL is running and execute `backend/schema.sql` to initialize tables and initial seed data:
```bash
psql -U postgres -d seatbooking -f backend/schema.sql
```

#### 2. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:4000`.

#### 3. Start the Frontend Next.js App
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔬 Concurrency Testing

To verify row-level locking and prevent race conditions when multiple users try to hold the same seat simultaneously, run the included test script:

```bash
cd backend
node test-concurrency.js
```

**Expected Output**:
One user successfully acquires the hold (`200 OK`), while the concurrent request is safely rejected (`409 Conflict - seat not available anymore`).

---

## 🛡️ Key Technical Implementations

1. **Database Level Lock (`FOR UPDATE`)**:
   When holding or confirming a seat, the backend wraps the operation in a SQL transaction (`BEGIN ... COMMIT`) and locks the target row with `SELECT * FROM seats WHERE id = $1 FOR UPDATE`. This guarantees isolation and prevents race conditions.
2. **Auto-refresh Token Interceptor**:
   The frontend uses `fetchWithAuth` to automatically catch `401 Unauthorized` responses, send the refresh token to `/auth/refresh`, receive a new access token, and transparently retry the request without logging the user out.
3. **Reactive WebSocket Cache Update**:
   When WebSocket events arrive, `useSeatWebSocket` directly updates TanStack Query's cached seat list (`queryClient.setQueryData`) for instant render updates without needing full page refetches.

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
