"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Clock, MapPin, Trash2, Plus, CheckCircle2, AlertTriangle, Pencil } from "lucide-react";

type LocationRow = {
  id: string;
  name: string;
  turnoverTime: number;
};

export default function SettingsView({ locations }: { locations: LocationRow[] }) {
  const router = useRouter();

  // Local list so we can update instantly (no Refresh button)
  const [items, setItems] = useState<LocationRow[]>(locations ?? []);

  useEffect(() => {
    setItems(locations ?? []);
  }, [locations]);

  // Add form state
  const [newLocName, setNewLocName] = useState("");
  const [newTurnover, setNewTurnover] = useState<number>(60);

  // Edit state for existing locations
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [draftTurnovers, setDraftTurnovers] = useState<Record<string, number>>({});

  // Loading & messages
  const [busyId, setBusyId] = useState<string | null>(null);
  const [globalBusy, setGlobalBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const canAdd = useMemo(() => {
    const nameOk = newLocName.trim().length >= 2;
    const turnoverOk = Number.isFinite(newTurnover) && newTurnover >= 10 && newTurnover <= 600;
    return nameOk && turnoverOk && !globalBusy;
  }, [newLocName, newTurnover, globalBusy]);

  function showOk(msg: string) {
    setOkMsg(msg);
    setTimeout(() => setOkMsg(null), 2200);
  }

  function showErr(msg: string) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3500);
  }

  async function handleAddLocation() {
    if (!canAdd) return;

    setGlobalBusy(true);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const res = await fetch("/api/restaurant/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLocName.trim(),
          turnoverTime: Number(newTurnover),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showErr(data?.error ?? "Could not create location.");
        return;
      }

      const created: LocationRow = data.location;

      // instantly show it (no refresh needed)
      setItems((prev) => [created, ...prev]);

      // reset form
      setNewLocName("");
      setNewTurnover(60);

      showOk(`Created "${created.name}" ✅`);

      // optional: keep server components in sync
      router.refresh();
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setGlobalBusy(false);
    }
  }

  async function handleSaveName(locationId: string) {
    const current = items.find((x) => x.id === locationId);
    const newName = (draftNames[locationId] ?? current?.name ?? "").trim();

    if (!current) return;
    if (newName.length < 2 || newName === current.name) return;

    setBusyId(locationId);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const res = await fetch(`/api/restaurant/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showErr(data?.error ?? "Could not update name.");
        return;
      }

      setItems((prev) => prev.map((x) => (x.id === locationId ? { ...x, name: data.location.name } : x)));
      setDraftNames((prev) => {
        const copy = { ...prev };
        delete copy[locationId];
        return copy;
      });

      showOk("Name saved ✅");
      router.refresh();
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveTurnover(locationId: string) {
    const current = items.find((x) => x.id === locationId);
    const newVal = draftTurnovers[locationId];

    if (!current) return;
    if (newVal === undefined || newVal === current.turnoverTime) return;
    if (!Number.isFinite(newVal) || newVal < 10 || newVal > 600) return;

    setBusyId(locationId);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const res = await fetch(`/api/restaurant/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoverTime: Number(newVal) }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showErr(data?.error ?? "Could not update turnover.");
        return;
      }

      setItems((prev) =>
        prev.map((x) => (x.id === locationId ? { ...x, turnoverTime: data.location.turnoverTime } : x))
      );

      setDraftTurnovers((prev) => {
        const copy = { ...prev };
        delete copy[locationId];
        return copy;
      });

      showOk("Turnover saved ✅");
      router.refresh();
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(locationId: string) {
    const loc = items.find((x) => x.id === locationId);
    if (!loc) return;

    const yes = confirm(`Delete "${loc.name}"? Tables & bookings inside it will be lost.`);
    if (!yes) return;

    setBusyId(locationId);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const res = await fetch(`/api/restaurant/locations?id=${encodeURIComponent(locationId)}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        showErr(data?.error ?? "Could not delete location.");
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== locationId));
      showOk("Deleted ✅");
      router.refresh();
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-1">Locations</h2>
        <p className="text-gray-500 text-sm">
          Add areas like <b>Main</b>, <b>Bar</b>, <b>Garden</b> and set the <b>turnover</b> time.
        </p>
      </div>

      {/* Alerts */}
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

      {/* Add location */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-black text-gray-900 mb-4">Add location</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500">Name</label>
            <input
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              placeholder="e.g. Main Restaurant, Bar, Garden..."
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
          {globalBusy ? (
            <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add location
        </button>
      </div>

      {/* List */}
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
            {items.map((loc) => {
              const nameDraft = draftNames[loc.id] ?? loc.name;
              const turnoverDraft = draftTurnovers[loc.id] ?? loc.turnoverTime;

              const nameChanged = nameDraft.trim() !== loc.name;
              const turnoverChanged = turnoverDraft !== loc.turnoverTime;

              return (
                <div
                  key={loc.id}
                  className="rounded-2xl border border-gray-200 p-4 flex flex-col gap-4 hover:shadow-sm transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    {/* Left */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
                        <MapPin className="w-5 h-5" />
                      </div>

                      <div className="w-full">
                        <div className="text-xs font-bold text-gray-500 mb-1">Location name</div>
                        <div className="flex items-center gap-2">
                          <input
                            value={nameDraft}
                            onChange={(e) => setDraftNames((p) => ({ ...p, [loc.id]: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold outline-none focus:border-black"
                          />
                          <button
                            onClick={() => handleSaveName(loc.id)}
                            disabled={!nameChanged || busyId === loc.id}
                            className="rounded-xl bg-black px-3 py-2 text-white font-bold text-sm disabled:opacity-50 inline-flex items-center gap-2"
                          >
                            {busyId === loc.id ? (
                              <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                              <Pencil className="w-4 h-4" />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="w-full md:w-auto">
                      <div className="text-xs font-bold text-gray-500 mb-1">Turnover (min)</div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            min={10}
                            max={600}
                            value={turnoverDraft}
                            onChange={(e) =>
                              setDraftTurnovers((p) => ({ ...p, [loc.id]: Number(e.target.value) }))
                            }
                            className="w-20 font-bold outline-none text-gray-900"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveTurnover(loc.id)}
                          disabled={!turnoverChanged || busyId === loc.id}
                          className="rounded-xl bg-black px-3 py-2 text-white font-bold text-sm disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {busyId === loc.id ? (
                            <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Current: <span className="font-bold">{loc.turnoverTime} min</span>
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
                        disabled={busyId === loc.id}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-200 inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
