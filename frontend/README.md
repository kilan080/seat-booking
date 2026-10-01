# 🎟️ SeatSpot Frontend — Real-Time Seat Reservation UI

This directory contains the Next.js frontend application for **SeatSpot**.

> For full documentation, architecture diagrams, database schema, and backend setup instructions, please see the [Main Project README](../README.md).

---

## ⚡ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Components**: React 19, Tailwind CSS v4, Lucide React
- **State Management**: Zustand (with local storage persistence)
- **Data Fetching & Caching**: TanStack React Query
- **Notifications**: React Hot Toast
- **Real-Time**: WebSockets Client (`useSeatWebSocket`)

---

## 🚀 Getting Started

### 1. Environment Configuration

Create a `.env.local` file in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📁 Key Directories

- `src/app/` — App Router pages (Home, Events, Admin, Login/Signup)
- `src/components/` — UI components (`SeatMap.tsx`)
- `src/hooks/` — Custom hooks (`useSeats`, `useEvents`, `useSeatWebSocket`)
- `src/lib/` — API helpers (`api.ts`, `fetchWithAuth.ts`)
- `src/store/` — Auth store (`auth-store.ts`)
