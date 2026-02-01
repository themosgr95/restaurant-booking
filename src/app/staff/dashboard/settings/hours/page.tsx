"use client";

import * as React from "react";
import { Button, Input } from "@/components/ui-primitives";

type Location = {
  id: string;
  name: string;
  turnoverMinutes: number | null;
};

type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

type WeeklyHour = {
  day: Weekday;
  isOpen: boolean;
  openTime: string; // "11:00"
  closeTime: string; // "22:00"
};

type SpecialRule = {
  id: string;
  type: "CLOSED" | "SPECIAL_HOURS";
  startDate: string; // "2026-02-01"
  endDate: string;   // "2026-02-15"
  openTime?: string; // only for SPECIAL_HOURS
  closeTime?: string;
  note?: string | null;
};

const DAYS: { day: Weekday; label: string }[] = [
  { day: "MONDAY", label: "Monday" },
  { day: "TUESDAY", label: "Tuesday" },
  { day: "WEDNESDAY", label: "Wednesday" },
  { day: "THURSDAY", label: "Thursday" },
  { day: "FRIDAY", label: "Friday" },
  { day: "SATURDAY", label: "Saturday" },
  { day: "SUNDAY", label: "Sunday" },
];

function defaultWeekly(): WeeklyHour[] {
  return DAYS.map(({ day }) => ({
    day,
    isOpen: true,
    openTime: "11:00",
    closeTime: "22:00",
  }));
}

export default function HoursPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [locationId, setLocationId] = React.useState<string>("");

  const [weekly, setWeekly] = React.useState<WeeklyHour[]>(defaultWeekly());
  const [rules, setRules] = React.useState<SpecialRule[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [savingWeekly, setSavingWeekly] = React.useState(false);
  const [savingRule, setSavingRule] = React.useState(false);

  // Add rule form
  const [ruleType, setRuleType] = React.useState<"CLOSED" | "SPECIAL_HOURS">(
    "CLOSED"
  );
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [openTime, setOpenTime] = React.useState("11:00");
  const [closeTime, setCloseTime] = React.useState("22:00");
  const [note, setNote] = React.useState("");

  const selectedLocation = locations.find((l) => l.id === locationId) || null;

  async function loadLocations() {
    const res = await fetch("/api/restaurant/locations");
    if (!res.ok) throw new Error("Failed to load locations");
    const data = await res.json();
    setLocations(data.locations || data || []);
    const firstId = (data.locations || data || [])[0]?.id || "";
    setLocationId((prev) => prev || firstId);
  }

  async function loadForLocation(id: string) {
    if (!id) return;
    setLoading(true);
    try {
      const [hoursRes, rulesRes] = await Promise.all([
        fetch(`/api/restaurant/locations/${id}/hours`),
        fetch(`/api/restaurant/locations/${id}/closures`),
      ]);

      // weekly hours
      if (hoursRes.ok) {
        const h = await hoursRes.json();
        setWeekly(h.weekly || h || defaultWeekly());
      } else {
        setWeekly(defaultWeekly());
      }

      // special rules (closures + special hours)
      if (rulesRes.ok) {
        const r = await rulesRes.json();
        setRules(r.rules || r || []);
      } else {
        setRules([]);
      }
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadLocations().catch(() => {});
  }, []);

  React.useEffect(() => {
    loadForLocation(locationId).catch(() => {});
  }, [locationId]);

  function updateDay(day: Weekday, patch: Partial<WeeklyHour>) {
    setWeekly((prev) =>
      prev.map((d) => (d.day === day ? { ...d, ...patch } : d))
    );
  }

  async function saveWeekly() {
    if (!locationId) return;
    setSavingWeekly(true);
    try {
      const res = await fetch(`/api/restaurant/locations/${locationId}/hours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekly }),
      });
      if (!res.ok) throw new Error("Failed to save weekly hours");
    } finally {
      setSavingWeekly(false);
    }
  }

  async function addRule() {
    if (!locationId) return;
    if (!startDate) return alert("Pick a start date");
    if (!endDate) return alert("Pick an end date");

    if (ruleType === "SPECIAL_HOURS") {
      if (!openTime || !closeTime) return alert("Pick times");
    }

    setSavingRule(true);
    try {
      const payload =
        ruleType === "CLOSED"
          ? { type: "CLOSED", startDate, endDate, note: note || null }
          : {
              type: "SPECIAL_HOURS",
              startDate,
              endDate,
              openTime,
              closeTime,
              note: note || null,
            };

      const res = await fetch(
        `/api/restaurant/locations/${locationId}/closures`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to add rule");

      // reload rules
      await loadForLocation(locationId);

      // reset form
      setStartDate("");
      setEndDate("");
      setNote("");
    } finally {
      setSavingRule(false);
    }
  }

  async function deleteRule(ruleId: string) {
    if (!locationId) return;
    const ok = confirm("Delete this rule?");
    if (!ok) return;

    const res = await fetch(
      `/api/restaurant/locations/${locationId}/closures?ruleId=${encodeURIComponent(
        ruleId
      )}`,
      { method: "DELETE" }
    );

    if (!res.ok) return alert("Failed to delete");
    await loadForLocation(locationId);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Hours</h1>
          <p className="text-sm text-muted-foreground">
            Weekly schedule + special hours and closures per location.
          </p>
        </div>
      </div>

      {/* Location selector */}
      <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">Location</div>
            <div className="text-xs text-muted-foreground">
              Pick the area/store you’re editing (Bar, Garden, etc.)
            </div>
          </div>

          <select
            className="h-10 w-full rounded-xl border px-3 text-sm sm:w-[320px]"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {selectedLocation && (
          <div className="mt-4 text-xs text-muted-foreground">
            Turnover for this location:{" "}
            <span className="font-medium text-black">
              {selectedLocation.turnoverMinutes ?? "—"} min
            </span>
          </div>
        )}
      </div>

      {/* Weekly schedule */}
      <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Weekly schedule</div>
            <div className="text-xs text-muted-foreground">
              These are the normal opening hours.
            </div>
          </div>

          <Button onClick={saveWeekly} disabled={savingWeekly || loading}>
            {savingWeekly ? "Saving..." : "Save weekly hours"}
          </Button>
        </div>

        <div className="space-y-3">
          {weekly.map((d) => (
            <div
              key={d.day}
              className="flex flex-col gap-3 rounded-2xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={d.isOpen}
                  onChange={(e) =>
                    updateDay(d.day, { isOpen: e.target.checked })
                  }
                />
                <div className="text-sm font-medium">
                  {DAYS.find((x) => x.day === d.day)?.label ?? d.day}
                </div>
                {!d.isOpen && (
                  <span className="text-xs text-muted-foreground">(Closed)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={d.openTime}
                  onChange={(e: any) =>
                    updateDay(d.day, { openTime: e.target.value })
                  }
                  disabled={!d.isOpen}
                />
                <span className="text-sm text-muted-foreground">–</span>
                <Input
                  type="time"
                  value={d.closeTime}
                  onChange={(e: any) =>
                    updateDay(d.day, { closeTime: e.target.value })
                  }
                  disabled={!d.isOpen}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special hours / closures */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="text-lg font-semibold">Special hours & closures</div>
          <div className="text-xs text-muted-foreground">
            Override the weekly schedule for holidays, events, vacations, etc.
          </div>
        </div>

        {/* Add rule */}
        <div className="mb-6 rounded-2xl border bg-muted/20 p-4">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-1">
              <label className="text-xs font-medium">Type</label>
              <select
                className="mt-1 h-10 w-full rounded-xl border px-3 text-sm"
                value={ruleType}
                onChange={(e) =>
                  setRuleType(e.target.value as "CLOSED" | "SPECIAL_HOURS")
                }
              >
                <option value="CLOSED">Closed</option>
                <option value="SPECIAL_HOURS">Special hours</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium">Start date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e: any) => setStartDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-medium">End date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e: any) => setEndDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              {ruleType === "SPECIAL_HOURS" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium">Open</label>
                    <Input
                      type="time"
                      value={openTime}
                      onChange={(e: any) => setOpenTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Close</label>
                    <Input
                      type="time"
                      value={closeTime}
                      onChange={(e: any) => setCloseTime(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground pt-7">
                  Closed means no bookings are allowed in this date range.
                </div>
              )}
            </div>

            <div className="md:col-span-5">
              <label className="text-xs font-medium">Note (optional)</label>
              <Input
                value={note}
                onChange={(e: any) => setNote(e.target.value)}
                placeholder='e.g. "Vacation", "Christmas", "Private event"...'
              />
            </div>
          </div>

          <div className="mt-3">
            <Button onClick={addRule} disabled={savingRule || loading}>
              {savingRule ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>

        {/* Rules list */}
        {rules.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No special rules yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium">
                    {r.type === "CLOSED" ? "Closed" : "Special hours"} •{" "}
                    {r.startDate} → {r.endDate}
                  </div>
                  {r.type === "SPECIAL_HOURS" && (
                    <div className="text-xs text-muted-foreground">
                      {r.openTime} – {r.closeTime}
                    </div>
                  )}
                  {r.note && (
                    <div className="text-xs text-muted-foreground">{r.note}</div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  onClick={() => deleteRule(r.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
