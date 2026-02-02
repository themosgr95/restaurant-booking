"use client";

import * as React from "react";
import { Button, Input } from "@/components/ui-primitives";

type Location = {
  id: string;
  name: string;
  slug?: string;
  turnoverTime?: number | null; // ✅ correct field
};

export default function SettingsPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [name, setName] = React.useState("");
  const [turnoverTime, setTurnoverTime] = React.useState<number>(60);

  async function loadLocations() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/restaurant/locations", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json) {
        setLocations([]);
        setError("Could not load locations.");
        return;
      }

      const list = Array.isArray(json.locations) ? json.locations : [];
      setLocations(list);
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
          turnoverTime: Number(turnoverTime),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error || "Could not create location.");
        return;
      }

      setName("");
      setTurnoverTime(60);
      await loadLocations();
    } catch {
      setError("Could not create location.");
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

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      alert(json?.error || "Could not delete location.");
      return;
    }

    await loadLocations();
  }

  async function updateTurnover(id: string, value: number) {
    const res = await fetch(`/api/restaurant/locations/${id}/turnover`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turnoverTime: value }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      alert(json?.error || "Could not update turnover.");
      return;
    }

    await loadLocations();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="mb-6 flex">
        <span className="rounded-xl bg-black px-3 py-2 text-sm text-white">Locations</span>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Add location */}
      <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-1 text-lg font-semibold">Add location</div>
        <div className="mb-5 text-sm text-muted-foreground">
          Create areas like Main Restaurant, Bar, Garden — and set how long a table stays locked after a booking.
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="e.g. Main Restaurant, Bar, Garden..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Turnover (min)</label>
            <Input
              type="number"
              value={turnoverTime}
              onChange={(e: any) => setTurnoverTime(Number(e.target.value))}
              min={5}
              step={5}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={addLocation} disabled={saving}>
            {saving ? "Adding..." : "Add location"}
          </Button>
          <Button variant="outline" onClick={loadLocations} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-4 text-lg font-semibold">Your locations</div>

        {locations.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No locations yet. Add one above (example: Bar / Garden).
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl border p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{l.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Turnover: {l.turnoverTime ?? 90} min
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Turnover</span>
                      <Input
                        type="number"
                        className="w-[140px]"
                        min={5}
                        step={5}
                        defaultValue={l.turnoverTime ?? 90}
                        onBlur={(e: any) => updateTurnover(l.id, Number(e.target.value))}
                      />
                      <span className="text-xs text-muted-foreground">min</span>
                    </div>

                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => deleteLocation(l.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
