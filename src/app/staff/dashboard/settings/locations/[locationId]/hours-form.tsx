"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 0=Sunday, 1=Monday, etc.
const DAYS = [
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
  { id: 0, label: "Sunday" },
];

export default function HoursForm({ locationId, initialData }: { locationId: string, initialData: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Helper to find existing data for a day
  const getDayData = (dayId: number) => initialData.find((d) => d.dayOfWeek === dayId);

  // State for form
  const [schedule, setSchedule] = useState(() => {
    return DAYS.map((day) => {
      const existing = getDayData(day.id);
      return {
        dayOfWeek: day.id,
        isOpen: !!existing,
        opensAt: existing?.opensAt || "09:00",
        closesAt: existing?.closesAt || "17:00",
      };
    });
  });

  const handleChange = (index: number, field: string, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setLoading(true);
    // Filter only open days to save
    const activeHours = schedule.filter((s) => s.isOpen);

    await fetch(`/api/restaurant/locations/${locationId}/hours`, {
      method: "POST",
      body: JSON.stringify({ hours: activeHours }),
    });

    setLoading(false);
    router.refresh();
    alert("Hours saved!");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Weekly Schedule</h2>
      <div className="space-y-4">
        {schedule.map((day, index) => (
          <div key={day.dayOfWeek} className="flex items-center gap-4 py-2 border-b last:border-0">
            <div className="w-32">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => handleChange(index, "isOpen", e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className={`text-sm ${day.isOpen ? "font-medium text-gray-900" : "text-gray-400"}`}>
                  {DAYS.find(d => d.id === day.dayOfWeek)?.label}
                </span>
              </label>
            </div>
            
            {day.isOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.opensAt}
                  onChange={(e) => handleChange(index, "opensAt", e.target.value)}
                  className="rounded border-gray-300 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="time"
                  value={day.closesAt}
                  onChange={(e) => handleChange(index, "closesAt", e.target.value)}
                  className="rounded border-gray-300 text-sm"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">Closed</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-800"
        >
          {loading ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}