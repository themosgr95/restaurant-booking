"use client";

import { useMemo, useState } from "react";
import { Button, Input, NativeSelect } from "@/components/ui-primitives";

type LocationLite = {
  id: string;
  name: string;
  turnoverTime: number;
};

type Props = {
  restaurantId: string;
  locations: LocationLite[];
};

type Step = 1 | 2 | 3 | 4 | 5;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function buildTimeslots() {
  // Simple default timeslots: 11:00 - 22:00 every 30 minutes
  const slots: string[] = [];
  for (let h = 11; h <= 22; h++) {
    slots.push(`${pad2(h)}:00`);
    if (h !== 22) slots.push(`${pad2(h)}:30`);
  }
  return slots;
}

export default function BookingClient({ restaurantId, locations }: Props) {
  const timeslots = useMemo(() => buildTimeslots(), []);

  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [date, setDate] = useState<string>(todayISO());

  // Step 2
  const [time, setTime] = useState<string>(timeslots[0] ?? "18:00");

  // Step 3
  const [guests, setGuests] = useState<number>(2);

  // Location (needed later)
  const [locationId, setLocationId] = useState<string>(locations?.[0]?.id ?? "");

  // Step 4
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(date) && Boolean(locationId);
    if (step === 2) return Boolean(time);
    if (step === 3) return guests >= 1 && guests <= 10;
    if (step === 4) return name.trim().length > 1;
    return true;
  }, [step, date, time, guests, name, locationId]);

  const goNext = () => {
    if (!canGoNext) return;
    setError("");
    setStep((s) => (Math.min(5, s + 1) as Step));
  };

  const goBack = () => {
    setError("");
    setStep((s) => (Math.max(1, s - 1) as Step));
  };

  const submitBooking = async () => {
    setLoading(true);
    setError("");

    try {
      // NOTE: This endpoint may currently be staff-protected in your project.
      // This is built to compile + deploy. We'll make the public booking API next.
      const res = await fetch("/api/restaurant/create-booking-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          locationId,
          date,
          time,
          guests,
          name,
          email,
          phone,
          notes,
          table: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create booking");
      }

      setStep(5);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={[
              "h-2.5 w-2.5 rounded-full transition-all",
              step >= n ? "bg-orange-500" : "bg-orange-100",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Choose location</p>
            <div className="mt-2">
              <NativeSelect value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Choose date</p>
            <div className="mt-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={goNext} disabled={!canGoNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Choose time</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {timeslots.slice(0, 18).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    time === t
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/50",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={goBack}>
              Back
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={goNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Party size</p>
            <p className="text-xs text-gray-500 mt-1">1 to 10 guests</p>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-gray-200 p-3">
              <Button type="button" variant="outline" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                −
              </Button>

              <div className="text-center">
                <div className="text-2xl font-black text-gray-900">{guests}</div>
                <div className="text-xs text-gray-500">guests</div>
              </div>

              <Button type="button" variant="outline" onClick={() => setGuests((g) => Math.min(10, g + 1))}>
                +
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={goBack}>
              Back
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={goNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Your details</p>
            <p className="text-xs text-gray-500 mt-1">We’ll use this to confirm your booking.</p>
          </div>

          <div className="space-y-3">
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <div className="text-sm text-red-600 font-semibold">{error}</div>}

          <div className="flex gap-2">
            <Button variant="outline" className="w-full" onClick={goBack} disabled={loading}>
              Back
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={submitBooking} disabled={loading || !canGoNext}>
              {loading ? "Booking..." : "Confirm"}
            </Button>
          </div>

          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 text-xs text-orange-800">
            <p className="font-bold">Summary</p>
            <p className="mt-1">
              {date} at {time} • {guests} guests
            </p>
          </div>
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-black">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Request received!</h3>
            <p className="text-sm text-gray-600 mt-1">We’ll confirm your reservation soon.</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setStep(1);
              setName("");
              setEmail("");
              setPhone("");
              setNotes("");
              setError("");
            }}
          >
            Make another booking
          </Button>
        </div>
      )}
    </div>
  );
}
