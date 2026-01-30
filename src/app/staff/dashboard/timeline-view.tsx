"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Users, Clock, MapPin } from "lucide-react";
import StaffBookingWizard from "./booking-wizard";

type Location = {
  id: string;
  name: string;
  turnoverTime?: number | null;
};

type Booking = {
  id: string;
  time?: string | null; // e.g. "18:30"
  guests?: number | null;
  customerName?: string | null;
  // Flattened tables (from server transform in page.tsx)
  tables?: { id: string; name: string; locationId: string }[];
  // If later you add other time fields, we can still support them.
  startAt?: string | Date | null;
  startTime?: string | Date | null;
  start_time?: string | Date | null;
};

function getBookingTimeLabel(b: Booking) {
  // 1) Plain string time like "18:30"
  if (typeof b?.time === "string" && b.time.trim()) return b.time;

  // 2) DateTime fields fallback (in case your schema changes later)
  const startAt = (b as any)?.startAt ?? (b as any)?.start_time ?? (b as any)?.startTime;
  if (startAt) {
    const d = new Date(startAt);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  return "—";
}

function toSortableTimeLabel(t: string) {
  // Turn "9:00" into "09:00" so sorting works properly
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return t;
  const hh = String(Number(m[1])).padStart(2, "0");
  return `${hh}:${m[2]}`;
}

export default function TimelineView({
  locations,
  bookings,
}: {
  locations: Location[];
  bookings: Booking[];
}) {
  const [query, setQuery] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [openWizard, setOpenWizard] = useState(false);

  // Ding sound when a new booking arrives
  const [prevBookingCount, setPrevBookingCount] = useState(bookings?.length ?? 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const current = bookings?.length ?? 0;
    if (current > prevBookingCount) {
      audioRef.current?.play().catch(() => {
        // Browser may block auto-play until interaction. That's fine.
      });
    }
    setPrevBookingCount(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings?.length]);

  const filteredBookings = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (bookings ?? [])
      .filter((b) => {
        // filter by location
        if (selectedLocationId !== "all") {
          const hasInLocation = (b.tables ?? []).some((t) => t.locationId === selectedLocationId);
          if (!hasInLocation) return false;
        }

        // filter by search query
        if (!q) return true;

        const name = (b.customerName ?? "").toLowerCase();
        const time = (b.time ?? "").toLowerCase();
        const tableNames = (b.tables ?? []).map((t) => t.name.toLowerCase()).join(" ");

        return name.includes(q) || time.includes(q) || tableNames.includes(q);
      })
      .sort((a, b) => {
        const ta = toSortableTimeLabel(getBookingTimeLabel(a));
        const tb = toSortableTimeLabel(getBookingTimeLabel(b));
        return ta.localeCompare(tb);
      });
  }, [bookings, query, selectedLocationId]);

  const bookingsByLocation = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const loc of locations ?? []) map[loc.id] = [];

    for (const b of filteredBookings) {
      // Put booking into every location it touches (based on tables)
      const locIds = new Set((b.tables ?? []).map((t) => t.locationId));
      if (locIds.size === 0) {
        // If it has no tables, we keep it in a "no-location" bucket later
        continue;
      }
      for (const lid of locIds) {
        if (!map[lid]) map[lid] = [];
        map[lid].push(b);
      }
    }

    return map;
  }, [filteredBookings, locations]);

  const noLocationBookings = useMemo(() => {
    return filteredBookings.filter((b) => (b.tables ?? []).length === 0);
  }, [filteredBookings]);

  return (
    <div className="space-y-6">
      {/* Hidden Ding sound */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Today’s Timeline</h2>
          <p className="text-sm text-gray-500">
            {filteredBookings.length} booking{filteredBookings.length === 1 ? "" : "s"} shown
          </p>
        </div>

        <button
          onClick={() => setOpenWizard(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white shadow hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" />
          New Reservation
        </button>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name / time / table…"
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400"
          >
            <option value="all">All locations</option>
            {(locations ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-3.5 text-gray-400">▾</div>
        </div>

        <div className="hidden lg:flex items-center justify-end">
          <div className="text-xs text-gray-500 font-semibold">
            Tip: click “New Reservation” to add a booking
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {(locations ?? [])
          .filter((l) => selectedLocationId === "all" || l.id === selectedLocationId)
          .map((loc) => {
            const locBookings = bookingsByLocation[loc.id] ?? [];

            return (
              <div key={loc.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{loc.name}</h3>
                    <p className="text-xs text-gray-500 font-semibold">
                      Turnover: {loc.turnoverTime ?? 90}m • {locBookings.length} booking
                      {locBookings.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {locBookings.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-gray-500 font-semibold">
                    No bookings here (with current filters).
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {locBookings.map((b) => (
                      <div key={b.id} className="px-5 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-16 shrink-0">
                            <div className="text-sm font-black text-gray-900 flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {getBookingTimeLabel(b)}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-black text-gray-900">
                              {b.customerName?.trim() ? b.customerName : "Walk-in / No name"}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-4 w-4 text-gray-400" />
                                {b.guests ?? "—"} guests
                              </span>
                              {(b.tables ?? [])
                                .filter((t) => t.locationId === loc.id)
                                .slice(0, 5)
                                .map((t) => (
                                  <span
                                    key={t.id}
                                    className="rounded-full bg-gray-50 border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-700"
                                  >
                                    {t.name}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 font-semibold">
                          Booking ID: <span className="font-mono">{b.id.slice(0, 8)}…</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* Bookings with no tables/location */}
        {noLocationBookings.length > 0 && (selectedLocationId === "all") && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40">
            <div className="border-b border-amber-200/60 px-5 py-4">
              <h3 className="text-lg font-black text-amber-900">Needs table assignment</h3>
              <p className="text-xs text-amber-800/80 font-semibold">
                These bookings have no tables linked yet.
              </p>
            </div>
            <div className="divide-y divide-amber-200/60">
              {noLocationBookings.map((b) => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-amber-900">
                      {b.customerName?.trim() ? b.customerName : "Walk-in / No name"}
                    </div>
                    <div className="text-xs font-semibold text-amber-800/80 mt-1">
                      {getBookingTimeLabel(b)} • {b.guests ?? "—"} guests
                    </div>
                  </div>
                  <div className="text-xs text-amber-800/70 font-semibold">
                    Booking ID: <span className="font-mono">{b.id.slice(0, 8)}…</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(locations ?? []).length > 0 && filteredBookings.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <div className="text-lg font-black text-gray-900">Nothing to show</div>
            <div className="mt-1 text-sm text-gray-500 font-semibold">
              Try clearing search or changing location filter.
            </div>
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {openWizard && (
        <StaffBookingWizard
          locations={locations}
          onClose={() => setOpenWizard(false)}
        />
      )}
    </div>
  );
}
