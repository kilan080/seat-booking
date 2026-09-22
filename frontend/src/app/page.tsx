"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Armchair,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  ArrowRight,
  CheckCircle2,
  Radio,
  Timer,
  LogIn,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Layers,
  Lock,
  Info,
} from "lucide-react";
import { useEvents } from "@/hooks/use-events";

export default function Home() {
  const { data: events = [], isLoading, isError, refetch } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E2E8F0] font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-112.5 bg-linear-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-200 right-0 w-125 h-125 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0C10]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <Armchair className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                SeatSpot{" "}
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium">
                  LIVE
                </span>
              </span>
              <span className="text-xs text-slate-400">
                Real-Time Event Booking
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a
              href="#events"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-indigo-400" /> Events
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-purple-400" /> How It Works
            </a>
            <a
              href="#features"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Features
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-200 hover:border-indigo-500/50"
            >
              <LogIn className="w-4 h-4 text-indigo-400" />
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-24">
        {/* HERO SECTION */}
        <section className="text-center space-y-8 pt-8 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium animate-pulse-slow">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Interactive Live Seat Map & Real-Time Sync</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Experience Events From <br />
            <span className="bg-linear-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              The Best Seats
            </span>{" "}
            In The House
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Select, hold, and instantly confirm seats in real time. Our
            interactive seating engine ensures zero collision double-bookings
            with live status synchronization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#events"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              Browse Active Events
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Info className="w-5 h-5 text-slate-400" />
              How Booking Works
            </a>
          </div>

          {/* Quick Stats / Info Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center gap-1">
              <Radio className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-sm font-semibold text-white">
                WebSocket Sync
              </span>
              <span className="text-xs text-slate-400">
                Live seat state updates
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center gap-1">
              <Lock className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-sm font-semibold text-white">
                Concurrency Lock
              </span>
              <span className="text-xs text-slate-400">
                Zero double bookings
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center gap-1">
              <Timer className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-sm font-semibold text-white">
                Timed Seat Holds
              </span>
              <span className="text-xs text-slate-400">
                Automatic release timer
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center gap-1">
              <Zap className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-sm font-semibold text-white">
                Instant Ticket
              </span>
              <span className="text-xs text-slate-400">
                Immediate confirmation
              </span>
            </div>
          </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section id="how-it-works" className="space-y-12 scroll-mt-24">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              Step-by-Step Guide
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              What You Do in the Seat Booking Event Page
            </h2>
            <p className="text-slate-400 text-base">
              Follow these simple steps to reserve your exact seat for any live
              concert, conference, or event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 relative group hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Step 01
                  </span>
                  <h3 className="text-xl font-bold text-white">Select Event</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Browse active events from our homepage grid and choose the
                    performance or conference you want to attend.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs text-indigo-300 gap-1 font-medium">
                Browse catalog <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 relative group hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  <Armchair className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    Step 02
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    View Seat Map
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Open the interactive seating chart. See color-coded seat
                    statuses updated in real time (Available, Held, Sold).
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs text-purple-300 gap-1 font-medium">
                Color-coded layout <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 relative group hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  <Timer className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Step 03
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Hold Your Seat
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Click an available seat to put a temporary hold on it. Other
                    users will see it locked instantly while you complete
                    checkout.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs text-amber-300 gap-1 font-medium">
                Temporary reservation <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 relative group hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Step 04
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    Confirm Booking
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Click confirm to lock in your purchase. Your seat status
                    changes permanently to Sold with immediate verification.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs text-emerald-300 gap-1 font-medium">
                Guaranteed ticket <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: LIVE EVENTS CATALOG */}
        <section id="events" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Ticket className="w-3.5 h-3.5" /> Active Event Listings
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Upcoming Events & Performances
              </h2>
              <p className="text-slate-400 text-sm">
                Select an event below to open its live interactive seat booking
                map.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* EVENTS CONTENT DISPLAY */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4 animate-pulse"
                >
                  <div className="h-6 bg-slate-800 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-800/60 rounded w-1/2" />
                  <div className="h-10 bg-slate-800/80 rounded-xl w-full pt-4" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-4 max-w-lg mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Failed to Load Events
                </h3>
                <p className="text-sm text-slate-400">
                  Could not retrieve live events from the booking backend
                  server.
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium text-sm transition-colors border border-red-500/30"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          {!isLoading && !isError && filteredEvents.length === 0 && (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-white/10 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Events Found</h3>
              <p className="text-slate-400 text-sm">
                No events match your current search term &quot;{searchTerm}
                &quot;.
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="group p-6 rounded-2xl bg-linear-to-b from-slate-900/80 to-slate-950/80 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                        Live Event #{event.id}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Seats Available
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {event.name}
                    </h3>

                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>Upcoming Schedule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>Main Arena Auditorium</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5">
                    <Link
                      href={`/events/${event.id}`}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-indigo-600/30"
                    >
                      <Armchair className="w-4 h-4" />
                      Select Seats & Book
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: PLATFORM FEATURES */}
        <section id="features" className="space-y-12 scroll-mt-24">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Engineered For Reliability
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Why Our Event Seat Booking System Stands Out
            </h2>
            <p className="text-slate-400 text-base">
              Designed with enterprise-grade synchronization to deliver a fast,
              fair, and frictionless ticketing experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Live WebSocket Sync
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                As soon as any user holds or confirms a seat, all connected
                clients receive real-time UI updates without page reloads.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Concurrency Protection
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Atomic database row locking guarantees that no two buyers can
                lock or acquire the same seat simultaneously.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Smart Hold Expiration
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unconfirmed seat holds expire automatically after the timer
                finishes, ensuring fair access for all fans.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#07080B] py-12 mt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Armchair className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">
              SeatSpot Event Engine
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} Seat-booking-system. All rights
            reserved. Real-time seat reservation platform.
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> Dev kilan
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
