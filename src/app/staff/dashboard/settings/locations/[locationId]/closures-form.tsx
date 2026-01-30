"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, AlertCircle, Trash2 } from "lucide-react";

export default function ClosuresForm({ locationId, closures }: { locationId: string, closures: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form Mode: 'single' or 'range'
  const [mode, setMode] = useState<"single" | "range">("single");
  
  // Data State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  
  // Rule Type: 'closed' or 'hours'
  const [type, setType] = useState<"closed" | "hours">("closed");
  const [opensAt, setOpensAt] = useState("12:00");
  const [closesAt, setClosesAt] = useState("22:00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If 'single' mode, endDate is same as startDate
    const finalEndDate = mode === "range" ? endDate : startDate;
    const isClosed = type === "closed";

    await fetch(`/api/restaurant/locations/${locationId}/closures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate,
        endDate: finalEndDate,
        isClosed,
        opensAt: isClosed ? null : opensAt,
        closesAt: isClosed ? null : closesAt,
        note
      }),
    });

    setLoading(false);
    // Reset form
    setNote("");
    setStartDate("");
    setEndDate("");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Remove this rule?")) return;
    await fetch(`/api/restaurant/locations/${locationId}/closures?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-5 h-5 text-gray-900" />
        <h2 className="text-lg font-bold text-gray-900">Special Days & Holidays</h2>
      </div>
      
      {/* 1. The Smart Form */}
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-8">
        
        {/* TABS: Single Day vs Range */}
        <div className="flex gap-4 border-b border-gray-200 pb-4 mb-4">
          <button 
            type="button"
            onClick={() => setMode("single")}
            className={`text-sm font-medium pb-1 ${mode === "single" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-gray-800"}`}
          >
            Single Date
          </button>
          <button 
            type="button"
            onClick={() => { setMode("range"); setType("closed"); }} // Range is usually for closing
            className={`text-sm font-medium pb-1 ${mode === "range" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-gray-800"}`}
          >
            Date Range (Holiday)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Date Inputs */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {mode === "range" ? "Start Date" : "Date"}
              </label>
              <input 
                type="date" 
                required 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm p-2"
              />
            </div>
            {mode === "range" && (
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                <input 
                  type="date" 
                  required 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm p-2"
                />
              </div>
            )}
          </div>

          {/* Type Selection (Only for Single Date) */}
          {mode === "single" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    checked={type === "closed"} 
                    onChange={() => setType("closed")}
                    className="text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-900">Closed All Day</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    checked={type === "hours"} 
                    onChange={() => setType("hours")}
                    className="text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-900">Special Hours</span>
                </label>
              </div>
            </div>
          )}

          {/* Special Hours Inputs */}
          {mode === "single" && type === "hours" && (
            <div className="flex items-center gap-2 bg-white p-3 rounded border border-gray-200">
              <Clock className="w-4 h-4 text-gray-400" />
              <input 
                type="time" 
                value={opensAt} 
                onChange={(e) => setOpensAt(e.target.value)}
                className="border-none p-0 text-sm focus:ring-0" 
              />
              <span className="text-gray-400 text-sm">-</span>
              <input 
                type="time" 
                value={closesAt} 
                onChange={(e) => setClosesAt(e.target.value)}
                className="border-none p-0 text-sm focus:ring-0" 
              />
            </div>
          )}

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Note (Optional)</label>
            <input 
              type="text" 
              placeholder={mode === "range" ? "e.g. Summer Break" : "e.g. Private Event"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm p-2"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !startDate}
            className="w-full bg-black text-white py-2.5 rounded-md text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : (mode === "range" ? `Close Restaurant (${startDate} to ${endDate})` : "Save Date")}
          </button>
        </form>
      </div>

      {/* 2. The List */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Upcoming Exceptions</h3>
        
        {closures.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
            <p className="text-sm text-gray-400">No special days configured.</p>
          </div>
        )}

        {closures.map((c) => (
          <div key={c.id} className="group flex justify-between items-center p-3 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${c.isClosed ? 'bg-red-500' : 'bg-green-500'}`} />
              <div>
                <span className="text-sm font-bold text-gray-900 block">
                  {new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs text-gray-500">
                  {c.isClosed 
                    ? <span className="text-red-600 font-medium">Closed</span> 
                    : <span className="text-green-700 font-medium">Open {c.opensAt} - {c.closesAt}</span>
                  }
                  {c.note && <span className="ml-2 text-gray-400">• {c.note}</span>}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => handleDelete(c.id)}
              className="text-gray-300 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}