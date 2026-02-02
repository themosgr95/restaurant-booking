"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui-primitives";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  turnoverTime: number;
};

export default function SettingsPage() {
  const [locations, setLocations] = React.useState<LocationRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [turnover, setTurnover] = React.useState<number>(60);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function loadLocations() {
    setLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/restaurant/locations", { cache: "no-store" });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || "Could not load locations.");
      }

      const data = (await res.json()) as { locations: LocationRow[] } | LocationRow[];
      const list = Array.isArray(data) ? data : data.locations;

      setLocations(list ?? []);
    } catch (e: any) {
      setFormError(e?.message || "Could not load locations.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadLocations();
  }, []);

  async function onCreateLocation() {
    setFormError(null);

    const cleanName = name.trim();
    const cleanTurnover = Number(turnover);

    if (!cleanName) {
      setFormError("Name is required.");
      return;
    }
    if (!Number.isFinite(cleanTurnover) || cleanTurnover <= 0) {
      setFormError("Turnover must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/restaurant/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          turnoverTime: cleanTurnover,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        // Show real API error if available
        setFormError(data?.error || "Could not create location.");
        return;
      }

      // ✅ Success: clear error, clear inputs, and append location immediately
      setFormError(null);
      setName("");
      setTurnover(60);

      const created: LocationRow =
        data?.location ?? data ?? {
          id: crypto.randomUUID(),
          name: cleanName,
          slug: cleanName.toLowerCase().replace(/\s+/g, "-"),
          turnoverTime: cleanTurnover,
        };

      setLocations((prev) => [created, ...prev]);
    } catch (e: any) {
      setFormError(e?.message || "Could not create location.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
        Locations
      </div>

      {formError ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      {/* Add location */}
      <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Add location</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create areas like Main Restaurant, Bar, Garden — and set how long a table stays locked after a booking.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g. Main Restaurant, Bar, Garden…"
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Turnover (min)</label>
            <Input
              value={String(turnover)}
              onChange={(e) => {
                setTurnover(Number(e.target.value));
                if (formError) setFormError(null);
              }}
              inputMode="numeric"
              className="mt-2"
            />
          </div>
        </div>

        <div className="mt-5">
          <Button onClick={onCreateLocation} disabled={submitting}>
            {submitting ? "Adding..." : "Add location"}
          </Button>
        </div>
      </div>

      {/* Locations list */}
      <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your locations</h2>
          <Button variant="outline" onClick={loadLocations} disabled={loading}>
            {loading ? "Loading..." : "Reload"}
          </Button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">Loading locations…</div>
        ) : locations.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">
            No locations yet. Add one above (example: Bar / Garden).
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium">{loc.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Turnover: {loc.turnoverTime} min
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/staff/dashboard/settings/locations/${loc.id}`}
                    className="text-sm font-medium underline underline-offset-4"
                  >
                    Manage
                  </Link>

                  {/* Keep delete if you already have it elsewhere; otherwise we can add it next */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
