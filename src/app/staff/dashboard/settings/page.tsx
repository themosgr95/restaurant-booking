"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Button, Input } from "@/components/ui-primitives";

type Location = {
  id: string;
  name: string;
  turnoverMinutes: number | null;
};

function SubTab({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm",
        active
          ? "bg-black text-white"
          : "text-muted-foreground hover:text-black hover:bg-muted/30",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function isLocationsPayload(payload: any): Location[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.locations)) return payload.locations;
  return [];
}

export default function LocationsPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  // form
  const [name, setName] = React.useState("");
  const [turnoverMinutes, setTurnoverMinutes] = React.useState<number>(60);

  async function loadLocations() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/restaurant/locations", { cache: "no-store" });
      const text = await res.text();
      const json = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })();

      if (!res.ok || !json) {
        setLocations([]);
        setError("Could not load locations (API error).");
        return;
      }

      setLocations(isLocationsPayload(json));
    } catch {
      setError("Could not load locations.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadLocations();
  }, []);

  async function addLocation() {
    if (!name.trim()) return alert("Please enter a location name.");

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/restaurant/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          turnoverMinutes: Number(turnoverMinutes),
        }),
      });

      if (!res.ok) {
        setError("Could not create location.");
        return;
      }

      setName("");
      setTurnoverMinutes(60);
      await loadLocations();
    } finally {
      setSaving(false);
    }
  }

  async function deleteLocation(id: string) {
    const ok = confirm("Delete this location?");
    if (!ok) return;

    const res = await fetch(`/api/restaurant/locations?locationId=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Could not delete location.");
      return;
    }

    await loadLocations();
  }

  async function updateTurnover(id: string, value: number) {
    // You already have /turnover route, so we use it
    const res = await fetch(`/api/restaurant/locations/${id}/turnover`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turnoverMinutes: value }),
    });

    if (!res.ok) {
      alert("Could not update turnover.");
      return;
    }

    await loadLocations();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      {/* Subtabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <SubTab href="/staff/dashboard/settings" label="Restaurant" />
        <SubTab href="/staff/dashboard/settings/locations" label="Locations" />
        <SubTab href="/staff/dashboard/settings/hours" label="Hours" />
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Add location */}
      <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4 text-lg font-semibold">Add location</div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="e.g. Main Restaurant, Bar, Garden..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Turnover (minutes)</label>
            <Input
              type="number"
              value={turnoverMinutes}
              onChange={(e: any) => setTurnoverMinutes(Number(e.target.value))}
              min={5}
              step={5}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={addLocation} disabled={saving}>
            {saving ? "Adding..." : "Add location"}
          </Button>
        </div>
      </div>

      {/* Location list */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">Your locations</div>
          <Button variant="outline" onClick={loadLocations} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {locations.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No locations yet. Add one above (example: Bar / Garden).
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((l) => (
              <div
                key={l.id}
                className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium">{l.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Turnover: {l.turnoverMinutes ?? "—"} min
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="number"
                    className="w-[140px]"
                    min={5}
                    step={5}
                    defaultValue={l.turnoverMinutes ?? 60}
                    onBlur={(e: any) => updateTurnover(l.id, Number(e.target.value))}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => deleteLocation(l.id)}
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
