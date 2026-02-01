"use client";

import * as React from "react";
import { Button, Input } from "@/components/ui-primitives";

type Location = { id: string; name: string; turnoverTime?: number | null };

type OpeningHour = {
  id: string;
  dayOfWeek: number; // 0..6
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type SpecialRule = {
  id: string;
  type: "CLOSED" | "SPECIAL_HOURS";
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  openTime: string | null;
  closeTime: string | null;
  note: string | null;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HoursPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [locationId, setLocationId] = React.useState<string>("");

  const [hours, setHours] = React.useState<OpeningHour[]>([]);
  const [rules, setRules] = React.useState<SpecialRule[]>([]);

  const [loadingLocations, setLoadingLocations] = React.useState(false);
  const [loadingHours, setLoadingHours] = React.useState(false);
  const [savingHours, setSavingHours] = React.useState(false);

  const [loadingRules, setLoadingRules] = React.useState(false);
  const [savingRule, setSavingRule] = React.useState(false);

  // errors
  const [globalError, setGlobalError] = React.useState("");
  const [hourErrors, setHourErrors] = React.useState<Record<string, string>>({});
  const [ruleErrors, setRuleErrors] = React.useState<Record<string, string>>({});

  // Add rule form
  const [ruleType, setRuleType] = React.useState<"CLOSED" | "SPECIAL_HOURS">("CLOSED");
  const [startDate, setStartDate] = React.useState(todayISO());
  const [endDate, setEndDate] = React.useState(todayISO());
  const [specialOpen, setSpecialOpen] = React.useState("11:00");
  const [specialClose, setSpecialClose] = React.useState("22:00");
  const [note, setNote] = React.useState("");

  async function loadLocations() {
    setLoadingLocations(true);
    setGlobalError("");
    try {
      const res = await fetch("/api/restaurant/locations", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json) {
        setLocations([]);
        setGlobalError("Could not load locations.");
        return;
      }

      const list: Location[] = Array.isArray(json.locations) ? json.locations : [];
      setLocations(list);

      const saved = localStorage.getItem("hours.locationId");
      const first = list[0]?.id || "";
      const pick = saved && list.some((l) => l.id === saved) ? saved : first;

      setLocationId(pick);
    } catch {
      setGlobalError("Could not load locations.");
    } finally {
      setLoadingLocations(false);
    }
  }

  async function loadWeeklyHours(locId: string) {
    if (!locId) return;
    setLoadingHours(true);
    setGlobalError("");
    setHourErrors({});
    try {
      const res = await fetch(`/api/restaurant/locations/${locId}/hours`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setHours([]);
        setGlobalError(json?.error || "Could not load weekly hours.");
        return;
      }

      const list: OpeningHour[] = Array.isArray(json?.hours) ? json.hours : [];
      setHours(list);
    } catch {
      setGlobalError("Could not load weekly hours.");
    } finally {
      setLoadingHours(false);
    }
  }

  async function loadSpecialRules(locId: string) {
    if (!locId) return;
    setLoadingRules(true);
    setGlobalError("");
    setRuleErrors({});
    try {
      const res = await fetch(`/api/restaurant/locations/${locId}/closures`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setRules([]);
        setGlobalError(json?.error || "Could not load special rules.");
        return;
      }

      const list: SpecialRule[] = Array.isArray(json?.rules) ? json.rules : [];
      setRules(list);
    } catch {
      setGlobalError("Could not load special rules.");
    } finally {
      setLoadingRules(false);
    }
  }

  React.useEffect(() => {
    loadLocations();
  }, []);

  React.useEffect(() => {
    if (!locationId) return;
    localStorage.setItem("hours.locationId", locationId);
    loadWeeklyHours(locationId);
    loadSpecialRules(locationId);
  }, [locationId]);

  function updateDay(dayOfWeek: number, patch: Partial<OpeningHour>) {
    setHours((prev) => prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)));
  }

  async function saveWeeklyHours() {
    if (!locationId) return;

    setSavingHours(true);
    setGlobalError("");
    setHourErrors({});

    try {
      const res = await fetch(`/api/restaurant/locations/${locationId}/hours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (json?.fieldErrors) setHourErrors(json.fieldErrors);
        setGlobalError(json?.error || "Could not save hours.");
        return;
      }

      await loadWeeklyHours(locationId);
    } catch {
      setGlobalError("Could not save hours.");
    } finally {
      setSavingHours(false);
    }
  }

  async function addRule() {
    if (!locationId) return;

    setSavingRule(true);
    setGlobalError("");
    setRuleErrors({});

    // client validation (so user sees errors immediately)
    const fe: Record<string, string> = {};
    if (!startDate) fe.startDate = "Pick a start date.";
    if (!endDate) fe.endDate = "Pick an end date.";
    if (startDate && endDate && startDate > endDate) fe.endDate = "End date must be after start date.";

    if (ruleType === "SPECIAL_HOURS") {
      if (!specialOpen) fe.openTime = "Pick open time.";
      if (!specialClose) fe.closeTime = "Pick close time.";
      if (specialOpen && specialClose && specialOpen >= specialClose) {
        fe.closeTime = "Close time must be after open time.";
      }
    }

    if (Object.keys(fe).length > 0) {
      setRuleErrors(fe);
      setSavingRule(false);
      return;
    }

    try {
      const res = await fetch(`/api/restaurant/locations/${locationId}/closures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: ruleType,
          startDate,
          endDate,
          openTime: ruleType === "SPECIAL_HOURS" ? specialOpen : null,
          closeTime: ruleType === "SPECIAL_HOURS" ? specialClose : null,
          note: note.trim() ? note.trim() : null,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (json?.fieldErrors) setRuleErrors(json.fieldErrors);
        setGlobalError(json?.error || "Could not add rule.");
        return;
      }

      // reset
      setRuleType("CLOSED");
      setStartDate(todayISO());
      setEndDate(todayISO());
      setNote("");

      await loadSpecialRules(locationId);
    } catch {
      setGlobalError("Could not add rule.");
    } finally {
      setSavingRule(false);
    }
  }

  async function deleteRule(ruleId: string) {
    if (!locationId) return;
    const ok = confirm("Delete this rule?");
    if (!ok) return;

    const res = await fetch(
      `/api/restaurant/locations/${locationId}/closures?ruleId=${encodeURIComponent(ruleId)}`,
      { method: "DELETE" }
    );

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      alert(json?.error || "Could not delete rule.");
      return;
    }

    await loadSpecialRules(locationId);
  }

  const selectedLocation = locations.find((l) => l.id === locationId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Hours</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set weekly opening times and add closures / holiday hours.
        </p>
      </div>

      {globalError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {globalError}
        </div>
      ) : null}

      {/* Location picker */}
      <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Location</div>
            <div className="text-xs text-muted-foreground">
              Choose which area you’re setting hours for.
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <select
              className="h-10 w-full rounded-xl border bg-white px-3 text-sm md:w-[260px]"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              disabled={loadingLocations}
            >
              {locations.length === 0 ? <option value="">No locations yet</option> : null}
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            <Button variant="outline" onClick={loadLocations} disabled={loadingLocations}>
              {loadingLocations ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {selectedLocation ? (
          <div className="mt-4 rounded-2xl bg-muted/30 p-4 text-sm">
            <span className="font-medium">{selectedLocation.name}</span>{" "}
            <span className="text-muted-foreground">
              • Turnover: {selectedLocation.turnoverTime ?? 90} min
            </span>
          </div>
        ) : null}
      </div>

      {/* Weekly schedule */}
      <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Weekly schedule</div>
            <div className="text-sm text-muted-foreground">
              Toggle a day off, or set open/close times.
            </div>
          </div>

          <Button onClick={saveWeeklyHours} disabled={savingHours || loadingHours || !locationId}>
            {savingHours ? "Saving..." : "Save"}
          </Button>
        </div>

        {loadingHours ? (
          <div className="text-sm text-muted-foreground">Loading weekly hours…</div>
        ) : hours.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No weekly hours yet. (This will auto-create after the Prisma change + API.)
          </div>
        ) : (
          <div className="space-y-2">
            {DAYS.map((day, idx) => {
              const row = hours.find((h) => h.dayOfWeek === idx);
              if (!row) return null;

              const dayErr = hourErrors[`day_${idx}`];

              return (
                <div key={idx} className="rounded-2xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded"
                        checked={row.isOpen}
                        onChange={(e) => updateDay(idx, { isOpen: e.target.checked })}
                      />
                      <div>
                        <div className="text-sm font-medium">{day}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.isOpen ? "Open" : "Closed"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Open</span>
                        <Input
                          type="time"
                          className="w-[140px]"
                          value={row.openTime}
                          disabled={!row.isOpen}
                          onChange={(e: any) => updateDay(idx, { openTime: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Close</span>
                        <Input
                          type="time"
                          className="w-[140px]"
                          value={row.closeTime}
                          disabled={!row.isOpen}
                          onChange={(e: any) => updateDay(idx, { closeTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {dayErr ? <div className="mt-2 text-xs text-red-600">{dayErr}</div> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Special rules */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <div className="text-lg font-semibold">Special hours & closures</div>
          <div className="text-sm text-muted-foreground">
            Add holidays, closures, or special opening hours (supports date ranges).
          </div>
        </div>

        <div className="mb-6 rounded-2xl border p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="h-10 w-full rounded-xl border bg-white px-3 text-sm"
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as any)}
              >
                <option value="CLOSED">Closed</option>
                <option value="SPECIAL_HOURS">Special hours</option>
              </select>
              {ruleErrors.type ? <div className="text-xs text-red-600">{ruleErrors.type}</div> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start</label>
              <Input type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
              {ruleErrors.startDate ? <div className="text-xs text-red-600">{ruleErrors.startDate}</div> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End</label>
              <Input type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
              {ruleErrors.endDate ? <div className="text-xs text-red-600">{ruleErrors.endDate}</div> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note (optional)</label>
              <Input value={note} onChange={(e: any) => setNote(e.target.value)} placeholder="e.g. Holiday, Private event…" />
            </div>
          </div>

          {ruleType === "SPECIAL_HOURS" ? (
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Open</label>
                <Input type="time" value={specialOpen} onChange={(e: any) => setSpecialOpen(e.target.value)} />
                {ruleErrors.openTime ? <div className="text-xs text-red-600">{ruleErrors.openTime}</div> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Close</label>
                <Input type="time" value={specialClose} onChange={(e: any) => setSpecialClose(e.target.value)} />
                {ruleErrors.closeTime ? <div className="text-xs text-red-600">{ruleErrors.closeTime}</div> : null}
              </div>
            </div>
          ) : null}

          <div className="mt-4">
            <Button onClick={addRule} disabled={!locationId || savingRule}>
              {savingRule ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>

        {loadingRules ? (
          <div className="text-sm text-muted-foreground">Loading special rules…</div>
        ) : rules.length === 0 ? (
          <div className="text-sm text-muted-foreground">No special rules yet.</div>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          r.type === "CLOSED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200",
                        ].join(" ")}
                      >
                        {r.type === "CLOSED" ? "Closed" : "Special hours"}
                      </span>

                      <div className="text-sm font-semibold">
                        {r.startDate} → {r.endDate}
                      </div>
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {r.type === "SPECIAL_HOURS"
                        ? `Hours: ${r.openTime ?? "—"} – ${r.closeTime ?? "—"}`
                        : "No bookings (closed)"}
                      {r.note ? ` • ${r.note}` : ""}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 md:self-start"
                    onClick={() => deleteRule(r.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
