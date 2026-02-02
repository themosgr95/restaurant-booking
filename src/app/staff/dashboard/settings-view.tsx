"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Trash2, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

type LocationRow = {
  id: string;
  name: string;
  turnoverTime: number;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function SettingsView({ locations }: { locations: LocationRow[] }) {
  const router = useRouter();

  // Keep a local list so we can update instantly (no refresh button)
  const [items, setItems] = useState<LocationRow[]>(locations ?? []);

  const [newLocName, setNewLocName] = useState("");
  const [newTurnover, setNewTurnover] = useState<number>(60);

  const [busy, setBusy] = useState(false);

  // Inline banners
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const canAdd = useMemo(() => {
    const nameOk = newLocName.trim().length >= 2;
    const turnoverOk = Number.isFinite(newTurnover) && newTurnover >= 10 && newTurnover <= 600;
    return nameOk && turnoverOk && !busy;
  }, [newLocName, newTurnover, busy]);

  async function handleAddLocation() {
    if (!canAdd) return;

    setBusy(true);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const payload = {
        name: newLocName.trim(),
        turnoverTime: Number(newTurnover),
      };

      const res = await fetch("/api/restaurant/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMsg(data?.error ?? "Could not create location.");
        return;
      }

      // Add instantly to list (no reload)
      setItems((prev) => [data.location, ...prev]);

      setNewLocName("");
      setNewTurnover(60);

      setOkMsg(`Location "${data.location.name}" created ✅`);
      // Optional: refresh server components if you rely on them elsewhere
      router.refresh();
    } catch (e) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setBusy(false);
      // auto-hide success after a bit
      setTimeout(() => setOkMsg(null), 2500);
    }
  }

  async function handleDelete(id: string) {
    const loc = items.find((x) => x.id === id);
    if (!confirm(`Delete "${loc?.name ?? "this location"}"? Tables & bookings inside it will be lost.`)) return;

    setBusy(true);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const res = await fetch(`/api/restaurant/locations?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMsg(data?.error ?? "Could not delete location.");
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== id));
      setOkMsg("Location deleted.");
      router.refresh();
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setBusy(false);
      setTimeout(() => setOkMsg(null), 2500);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-1">Locations</h2>
        <p className="text-gray-500 text-sm">
          Create areas like <b>Main</b>, <b>Bar</b>, <b>Garden</b> and set the <b>turnover time</b> (how long a table stays locked after a booking).
        </p>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div className="text-sm font-semibold">{errorMsg}</div>
        </div>
      )}

      {okMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 mt-0.5" />
          <div className="text-sm font-semibold">{okMsg}</div>
        </div>
      )}

      {/* Add Location Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-black text-gray-900 mb-4">Add location</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500">Name</label>
            <input
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              placeholder="e.g. Garden, Bar, Main..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Turnover (min)</label>
            <input
              type="number"
              min={10}
              max={600}
              value={newTurnover}
              onChange={(e) => setNewTurnover(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-black"
            />
          </div>
        </div>

        <button
          disabled={!canAdd}
          onClick={handleAddLocation}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-white font-bold text-sm disabled:opacity-50"
        >
          {busy ? (
            <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add location
        </button>
      </div>

      {/* Locations list */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">Your locations</h3>
          <div className="text-xs text-gray-500">{items.length} total</div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="font-bold text-gray-900">No locations yet</div>
            <div className="text-sm text-gray-500">Add your first area above.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((loc) => (
              <div
                key={loc.id}
                className="rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 leading-tight">{loc.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" /> {loc.turnoverTime} min turnover
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/staff/dashboard/settings/locations/${loc.id}`}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold hover:bg-gray-50"
                  >
                    Manage
                  </Link>

                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-200 inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
