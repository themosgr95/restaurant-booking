"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

type LocationRow = {
  id: string;
  name: string;
  turnoverTime: number;
};

type ApiLocationResponse =
  | { location: LocationRow }
  | { success: true }
  | { error: string };

export default function SettingsView({ locations }: { locations: LocationRow[] }) {
  const router = useRouter();

  // local list (so we update instantly without a refresh button)
  const [items, setItems] = useState<LocationRow[]>(locations ?? []);
  useEffect(() => setItems(locations ?? []), [locations]);

  // add form
  const [newLocName, setNewLocName] = useState("");
  const [newTurnover, setNewTurnover] = useState<number>(60);

  // edit drafts
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [draftTurnovers, setDraftTurnovers] = useState<Record<string, number>>({});

  // busy + toasts
  const [busyId, setBusyId] = useState<string | null>(null);
  const [globalBusy, setGlobalBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // field errors (shown next to fields)
  const [fieldErr, setFieldErr] = useState<{ name?: string; turnover?: string }>({});

  function showOk(msg: string) {
    setOkMsg(msg);
    setTimeout(() => setOkMsg(null), 2200);
  }

  function showErr(msg: string) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  }

  const canAdd = useMemo(() => {
    const name = newLocName.trim();
    const turnoverOk = Number.isFinite(newTurnover) && newTurnover >= 10 && newTurnover <= 600;
    return name.length >= 2 && turnoverOk && !globalBusy;
  }, [newLocName, newTurnover, globalBusy]);

  async function handleAddLocation() {
    setErrorMsg(null);
    setOkMsg(null);

    const name = newLocName.trim();
    const turnover = Number(newTurnover);

    const nextFieldErr: typeof fieldErr = {};
    if (name.length < 2) nextFieldErr.name = "Name must be at least 2 characters.";
    if (!Number.isFinite(turnover) || turnover < 10 || turnover > 600)
      nextFieldErr.turnover = "Turnover must be between 10 and 600.";

    setFieldErr(nextFieldErr);
    if (Object.keys(nextFieldErr).length) return;

    setGlobalBusy(true);

    try {
      const res = await fetch("/api/restaurant/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, turnoverTime: turnover }),
      });

      const data = (await res.json().catch(() => null)) as ApiLocationResponse | null;

      if (!res.ok) {
        showErr((data as any)?.error ?? "Could not create location.");
        return;
      }

      const created = (data as any)?.location as LocationRow | undefined;
      if (!created?.id) {
        showErr("Created location, but response was unexpected.");
        return;
      }

      setItems((prev) => [created, ...prev]);
      setNewLocName("");
      setNewTurnover(60);
      setFieldErr({});
      showOk(`Created "${created.name}"`);

      // keep server components synced
      router.refresh();
    } catch {
      showErr("Network error. Please try again.");
    } finally {
      setGlobalBusy(false);
    }
  }

  async function savePatch(locationId: string, patch: Partial<Pick<LocationRow, "name" | "turnoverTime">>) {
    setBusyId(locationId);
    setErrorMsg(null);
    setOkMsg(null);

    try {
      const res = await fetch(`/api/restaurant/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const data = (await res.json().catch(() => null)) as ApiLocationResponse | null;

      if (!res.ok) {
        showErr((data as any)?.error ?? "Could not save changes.");
        return null;
      }

      const updated = (data as any)?.location as LocationRow | undefined;
      if (!updated?.id) {
        showErr("Saved, but response was unexpected.");
        return null;
      }

      setItems((prev) => prev.map((x) => (x.id === locationId ? updated : x)));
      router.refresh();
      return updated;
    } catch {
      showErr("Network error. Please try again.");
      return null;
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveName(locationId: string) {
    const current = items.find((x) => x.id === locationId);
    if (!current) return;

    const nextName = (draftNames[locationId] ?? current.name).trim();
    if (nextName.length < 2) return showErr("Name must be at least 2 characters.");
    if (nextName === current.name) return;

    const updated = await savePatch(locationId, { name: nextName });
    if (updated) {
      setDraftNames((p) => {
        const copy = { ...p };
        delete copy[locationId];
        return copy;
      });
      showOk("Name saved");
    }
  }

  async function handleSaveTurnover(locationId: string) {
    const current = items.find((x) => x.id === locationId);
    if (!current) return;

    const nextVal = draftTurnovers[locationId];
    if (nextVal === undefined || nextVal === current.turnoverTime) return;
    if (!Number.isFinite(nextVal) || nextVal < 10 || nextVal > 600)
      return showErr("Turnover must be between 10 and 600.");

    const updated = await savePatch(locationId, { turnoverTime: Number(nextVal) });
    if (updated) {
      setDraftTurnovers((p) => {
        const copy = { ...p };
        delete copy[locationId];
        return copy;
      });
      showOk("Turnover saved");
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
      const res = await fetch(`/api/restaurant/locations/${locationId}`, {
        method: "DELETE",
      });

      const data = (await res.json().catch(() => null)) as ApiLocationResponse | null;

      if (!res.ok) {
        showErr((data as any)?.error ?? "Could not delete location.");
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== locationId));
      showOk("Deleted");
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
            <label htmlFor="new-location-name" className="text-xs font-bold text-gray-500">
              Name
            </label>
            <input
              id="new-location-name"
              name="new-location-name"
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              placeholder="e.g. Main Restaurant, Bar, Garden..."
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-black"
              autoComplete="off"
            />
            {fieldErr.name && <div className="mt-1 text-xs font-bold text-red-600">{fieldErr.name}</div>}
          </div>

          <div>
            <label htmlFor="new-location-turnover" className="text-xs font-bold text-gray-500">
              Turnover (min)
            </label>
            <input
              id="new-location-turnover"
              name="new-location-turnover"
              type="number"
              min={10}
              max={600}
              value={newTurnover}
              onChange={(e) => setNewTurnover(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold outline-none focus:border-black"
            />
            {fieldErr.turnover && (
              <div className="mt-1 text-xs font-bold text-red-600">{fieldErr.turnover}</div>
            )}
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
                    {/* Name */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
                        <MapPin className="w-5 h-5" />
                      </div>

                      <div className="w-full">
                        <label htmlFor={`loc-name-${loc.id}`} className="text-xs font-bold text-gray-500 mb-1 block">
                          Location name
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id={`loc-name-${loc.id}`}
                            name={`loc-name-${loc.id}`}
                            value={nameDraft}
                            onChange={(e) => setDraftNames((p) => ({ ...p, [loc.id]: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold outline-none focus:border-black"
                            autoComplete="off"
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

                    {/* Turnover */}
                    <div className="w-full md:w-auto">
                      <label
                        htmlFor={`loc-turnover-${loc.id}`}
                        className="text-xs font-bold text-gray-500 mb-1 block"
                      >
                        Turnover (min)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <input
                            id={`loc-turnover-${loc.id}`}
                            name={`loc-turnover-${loc.id}`}
                            type="number"
                            min={10}
                            max={600}
                            value={turnoverDraft}
                            onChange={(e) =>
                              setDraftTurnovers((p) => ({ ...p, [loc.id]: Number(e.target.value) }))
                            }
                            className="w-20 font-bold outline-none text-gray-900"
                          />
                          <span className="text-xs font-bold text-gray-500">min</span>
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
