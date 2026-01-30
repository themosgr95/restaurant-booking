"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Users, Clock, ArrowRight, ArrowLeft, MapPin, CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";

type Location = {
  id: string;
  name: string;
};

type Table = {
  id: string;
  name?: string | null;
  capacity: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function formatHumanDate(dateStr: string) {
  // dateStr: YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function StepOne({
  onNext,
  onClose,
  locations,
}: {
  onNext: (payload: { locationId: string; guests: number; date: string; time: string }) => void;
  onClose: () => void;
  locations: Location[];
}) {
  const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
  const defaultTime = oneHourLater.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState(defaultTime);
  const [guests, setGuests] = useState(2);
  const [locationId, setLocationId] = useState("");

  const [loadingDates, setLoadingDates] = useState(false);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedDateStr = useMemo(() => toDateStr(selectedDate), [selectedDate]);
  const currentMonthKey = useMemo(() => monthKey(selectedDate), [selectedDate]);

  // Fetch available dates (only show selectable dates for this guest count)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setAvailableDates(new Set());
      setClosedDates(new Set());
      setSlots([]);
      if (!locationId || !guests) return;

      setLoadingDates(true);
      try {
        const res = await fetch(
          `/api/restaurant/availability/dates?locationId=${encodeURIComponent(locationId)}&guests=${encodeURIComponent(
            String(guests)
          )}&month=${encodeURIComponent(currentMonthKey)}`
        );
        const data = await res.json();
        if (cancelled) return;

        const avail = new Set<string>((data?.availableDates ?? []) as string[]);
        const closed = new Set<string>((data?.closedDates ?? []) as string[]);
        setAvailableDates(avail);
        setClosedDates(closed);

        // If current selected date is not available, jump to first available date in month
        if (!avail.has(selectedDateStr)) {
          const first = (data?.availableDates ?? [])[0];
          if (first) {
            const [y, m, d] = first.split("-").map(Number);
            setSelectedDate(new Date(y, (m || 1) - 1, d || 1));
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingDates(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [locationId, guests, currentMonthKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch slots for chosen date
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setSlots([]);
      if (!locationId || !guests) return;
      const dateStr = selectedDateStr;

      // If the day is closed or not available, don't fetch slots
      if (closedDates.has(dateStr) || (availableDates.size > 0 && !availableDates.has(dateStr))) return;

      setLoadingSlots(true);
      try {
        const res = await fetch(
          `/api/restaurant/availability/slots?locationId=${encodeURIComponent(locationId)}&guests=${encodeURIComponent(
            String(guests)
          )}&date=${encodeURIComponent(dateStr)}`
        );
        const data = await res.json();
        if (cancelled) return;

        const nextSlots = (data?.slots ?? []) as string[];
        setSlots(nextSlots);

        // If current time is not available, pick first available slot
        if (nextSlots.length > 0 && !nextSlots.includes(time)) {
          setTime(nextSlots[0]);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [locationId, guests, selectedDateStr, availableDates, closedDates]); // eslint-disable-line react-hooks/exhaustive-deps

  const canProceed = Boolean(locationId && guests > 0 && selectedDateStr && time && availableDates.has(selectedDateStr) && slots.includes(time));

  const dayCellClass = (dateStr: string, day: number) => {
    const isSelected = dateStr === selectedDateStr;

    if (!locationId) {
      return `text-sm px-3 py-2 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed ${isSelected ? "ring-2 ring-gray-200" : ""}`;
    }

    if (closedDates.has(dateStr)) {
      return `text-sm px-3 py-2 rounded-lg bg-red-50 text-red-400 cursor-not-allowed ${isSelected ? "ring-2 ring-red-200" : ""}`;
    }

    if (availableDates.size > 0 && !availableDates.has(dateStr)) {
      return `text-sm px-3 py-2 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed ${isSelected ? "ring-2 ring-gray-200" : ""}`;
    }

    return `text-sm px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 cursor-pointer ${
      isSelected ? "ring-2 ring-emerald-300" : ""
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold text-lg flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            New reservation
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="p-4 rounded-xl border">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select location...</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Turnover time + opening hours + special closures are used automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl border">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Users className="w-4 h-4" />
                Guests
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full border rounded-lg px-3 py-2 text-center"
                />
                <button className="px-3 py-2 rounded-lg border hover:bg-gray-50" onClick={() => setGuests((g) => g + 1)}>
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Calendar only shows days that can fit this party size.</p>
            </div>

            <div className="p-4 rounded-xl border">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Clock className="w-4 h-4" />
                Time
              </div>

              {!locationId ? (
                <div className="text-sm text-gray-500">Choose a location first.</div>
              ) : loadingSlots ? (
                <div className="text-sm text-gray-500">Loading available times…</div>
              ) : slots.length === 0 ? (
                <div className="text-sm text-gray-500">No available times for this day.</div>
              ) : (
                <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  {slots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">
                {selectedDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                >
                  Next
                </button>
              </div>
            </div>

            {loadingDates && locationId ? (
              <div className="text-sm text-gray-500">Loading availability…</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                  const dateStr = `${selectedDate.getFullYear()}-${pad2(selectedDate.getMonth() + 1)}-${pad2(day)}`;
                  const disabled =
                    !locationId || closedDates.has(dateStr) || (availableDates.size > 0 && !availableDates.has(dateStr));
                  return (
                    <button
                      key={day}
                      disabled={disabled}
                      className={dayCellClass(dateStr, day)}
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                      title={
                        closedDates.has(dateStr)
                          ? "Closed"
                          : availableDates.size > 0 && !availableDates.has(dateStr)
                          ? "No availability"
                          : "Available"
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                Available
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                No availability
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-200" />
                Closed (holiday / closure)
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Cancel
          </button>
          <button
            disabled={!canProceed}
            onClick={() => onNext({ locationId, guests, date: selectedDateStr, time })}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              canProceed ? "bg-black text-white hover:bg-black/90" : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StepTwo({
  onBack,
  onNext,
  onClose,
  payload,
  locations,
}: {
  onBack: () => void;
  onNext: (table: Table) => void;
  onClose: () => void;
  payload: { locationId: string; guests: number; date: string; time: string };
  locations: Location[];
}) {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  const locationName = useMemo(() => locations.find((l) => l.id === payload.locationId)?.name ?? "Location", [locations, payload.locationId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setTables([]);
      setSelectedTableId("");

      try {
        const res = await fetch(
          `/api/restaurant/availability?locationId=${encodeURIComponent(payload.locationId)}&date=${encodeURIComponent(
            payload.date
          )}&time=${encodeURIComponent(payload.time)}&guests=${encodeURIComponent(String(payload.guests))}`
        );
        const data = await res.json();
        if (cancelled) return;

        setTables((data?.availableTables ?? []) as Table[]);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const selectedTable = useMemo(() => tables.find((t) => t.id === selectedTableId) ?? null, [tables, selectedTableId]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold text-lg">Choose table</div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="text-sm text-gray-600 mb-4">
            <span className="font-medium">{locationName}</span> • {formatHumanDate(payload.date)} •{" "}
            <span className="font-medium">{payload.time}</span> • {payload.guests} guests
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Checking available tables…</div>
          ) : tables.length === 0 ? (
            <div className="text-sm text-gray-500">No tables available for this time (opening hours + closures + turnover are enforced).</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`p-4 rounded-xl border text-left hover:bg-gray-50 ${
                    selectedTableId === t.id ? "border-black ring-2 ring-black/10" : "border-gray-200"
                  }`}
                >
                  <div className="font-medium">{t.name ?? `Table ${t.id.slice(0, 6)}`}</div>
                  <div className="text-sm text-gray-600">Capacity: {t.capacity}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <button onClick={onBack} className="px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            disabled={!selectedTable}
            onClick={() => selectedTable && onNext(selectedTable)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              selectedTable ? "bg-black text-white hover:bg-black/90" : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StepThree({
  onBack,
  onClose,
  payload,
  table,
  locations,
}: {
  onBack: () => void;
  onClose: () => void;
  payload: { locationId: string; guests: number; date: string; time: string };
  table: Table;
  locations: Location[];
}) {
  const router = useRouter();

  const locationName = useMemo(() => locations.find((l) => l.id === payload.locationId)?.name ?? "Location", [locations, payload.locationId]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 1 && email.trim().includes("@");

  async function createBooking() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/staff/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: payload.locationId,
          tableId: table.id,
          date: payload.date,
          time: payload.time,
          guests: payload.guests,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to create booking");
        return;
      }

      setCreatedId(data?.booking?.id ?? null);
      setConfirmOpen(true);
    } catch {
      setError("Failed to create booking");
    } finally {
      setSaving(false);
    }
  }

  function closeAndRefresh() {
    setConfirmOpen(false);
    onClose();
    router.refresh();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-semibold text-lg">Customer details</div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            <div className="p-4 rounded-xl border mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{locationName}</span> • {formatHumanDate(payload.date)} •{" "}
                <span className="font-medium">{payload.time}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Table: <span className="font-medium">{table.name ?? table.id.slice(0, 6)}</span> • Guests:{" "}
                <span className="font-medium">{payload.guests}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Phone (optional)</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <button onClick={onBack} className="px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              disabled={!canSave || saving}
              onClick={createBooking}
              className={`px-4 py-2 rounded-lg ${
                canSave && !saving ? "bg-black text-white hover:bg-black/90" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving…" : "Confirm reservation"}
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b font-semibold">Reservation confirmed ✅</div>

            <div className="p-5 space-y-2">
              <div className="text-sm text-gray-700">
                Please repeat with the customer:
              </div>

              <div className="p-4 rounded-xl border bg-gray-50">
                <div className="font-medium">{locationName}</div>
                <div className="text-sm text-gray-700 mt-1">
                  Date: <span className="font-medium">{formatHumanDate(payload.date)}</span>
                </div>
                <div className="text-sm text-gray-700">
                  Time: <span className="font-medium">{payload.time}</span>
                </div>
                <div className="text-sm text-gray-700">
                  Guests: <span className="font-medium">{payload.guests}</span>
                </div>
                <div className="text-sm text-gray-700">
                  Table: <span className="font-medium">{table.name ?? table.id.slice(0, 6)}</span>
                </div>
                {createdId && (
                  <div className="text-xs text-gray-500 mt-2">Booking ID: {createdId}</div>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={closeAndRefresh} className="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/90">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function StaffBookingWizard({
  open,
  onClose,
  locations,
}: {
  open: boolean;
  onClose: () => void;
  locations: Location[];
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [payload, setPayload] = useState<{ locationId: string; guests: number; date: string; time: string } | null>(null);
  const [table, setTable] = useState<Table | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setPayload(null);
      setTable(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {step === 1 && (
        <StepOne
          locations={locations}
          onClose={onClose}
          onNext={(p) => {
            setPayload(p);
            setStep(2);
          }}
        />
      )}

      {step === 2 && payload && (
        <StepTwo
          locations={locations}
          payload={payload}
          onClose={onClose}
          onBack={() => setStep(1)}
          onNext={(t) => {
            setTable(t);
            setStep(3);
          }}
        />
      )}

      {step === 3 && payload && table && (
        <StepThree
          locations={locations}
          payload={payload}
          table={table}
          onClose={onClose}
          onBack={() => setStep(2)}
        />
      )}
    </>
  );
}
