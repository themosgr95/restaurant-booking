"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, Trash2, Filter, ChevronRight } from "lucide-react";

// Helper to check if two dates are consecutive (yesterday vs today)
const isConsecutive = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays === 1;
};

export default function ClosuresForm({ locationId, closures }: { locationId: string, closures: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 1. Filter State
  const [filter, setFilter] = useState<"all" | "closed" | "hours">("all");

  // Form State
  const [mode, setMode] = useState<"single" | "range">("single");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"closed" | "hours">("closed");
  const [opensAt, setOpensAt] = useState("12:00");
  const [closesAt, setClosesAt] = useState("22:00");

  // 2. Smart Grouping Logic
  const groupedClosures = useMemo(() => {
    // First, apply filter
    const filtered = closures.filter(c => {
      if (filter === "all") return true;
      if (filter === "closed") return c.isClosed;
      if (filter === "hours") return !c.isClosed;
      return true;
    });

    // Then, group consecutive dates
    const groups: any[] = [];
    
    filtered.forEach((c) => {
      const currentDate = new Date(c.date);
      const lastGroup = groups[groups.length - 1];

      // Check if we should merge with the previous group
      if (lastGroup) {
        const lastDate = new Date(lastGroup.endDate);
        const isSeq = isConsecutive(lastDate, currentDate);
        const sameStatus = lastGroup.isClosed === c.isClosed;
        const sameHours = lastGroup.opensAt === c.opensAt && lastGroup.closesAt === c.closesAt;
        const sameNote = lastGroup.note === c.note;

        if (isSeq && sameStatus && sameHours && sameNote) {
          // Extend the group
          lastGroup.endDate = c.date;
          lastGroup.ids.push(c.id);
          return;
        }
      }

      // Otherwise, start a new group
      groups.push({
        ids: [c.id],
        startDate: c.date,
        endDate: c.date,
        isClosed: c.isClosed,
        opensAt: c.opensAt,
        closesAt: c.closesAt,
        note: c.note
      });
    });

    return groups;
  }, [closures, filter]);

  // Actions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
    setNote("");
    setStartDate("");
    setEndDate("");
    router.refresh();
  };

  const handleBulkDelete = async (ids: string[]) => {
    if(!confirm(`Remove these ${ids.length} exceptions?`)) return;
    
    // Delete all IDs in parallel
    await Promise.all(
      ids.map(id => fetch(`/api/restaurant/locations/${locationId}/closures?id=${id}`, { method: "DELETE" }))
    );
    
    router.refresh();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-5 h-5 text-gray-900" />
        <h2 className="text-lg font-bold text-gray-900">Special Days & Holidays</h2>
      </div>
      
      {/* Form Area (Unchanged) */}
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-8">
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
            onClick={() => { setMode("range"); setType("closed"); }}
            className={`text-sm font-medium pb-1 ${mode === "range" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-gray-800"}`}
          >
            Date Range
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {mode === "single" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" checked={type === "closed"} onChange={() => setType("closed")} className="text-black focus:ring-black" />
                  <span className="text-sm font-medium text-gray-900">Closed All Day</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" checked={type === "hours"} onChange={() => setType("hours")} className="text-black focus:ring-black" />
                  <span className="text-sm font-medium text-gray-900">Special Hours</span>
                </label>
              </div>
            </div>
          )}

          {mode === "single" && type === "hours" && (
            <div className="flex items-center gap-2 bg-white p-3 rounded border border-gray-200">
              <Clock className="w-4 h-4 text-gray-400" />
              <input type="time" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} className="border-none p-0 text-sm focus:ring-0" />
              <span className="text-gray-400 text-sm">-</span>
              <input type="time" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} className="border-none p-0 text-sm focus:ring-0" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Note (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Summer Holiday"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm p-2"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !startDate}
            className="w-full bg-black text-white py-2.5 rounded-md text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Exception"}
          </button>
        </form>
      </div>

      {/* 3. The New List Header with Filters */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Upcoming Exceptions ({groupedClosures.length})
        </h3>
        <div className="flex bg-gray-100 rounded-md p-0.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${filter === "all" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("closed")}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${filter === "closed" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            Closed
          </button>
          <button
            onClick={() => setFilter("hours")}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${filter === "hours" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            Open
          </button>
        </div>
      </div>

      {/* 4. The Smart Grouped List */}
      <div className="space-y-1">
        {groupedClosures.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
            <p className="text-sm text-gray-400">No dates found.</p>
          </div>
        )}

        {groupedClosures.map((group, idx) => {
          const isRange = group.startDate !== group.endDate;
          const startStr = new Date(group.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const endStr = new Date(group.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          
          return (
            <div key={idx} className="group flex justify-between items-center p-3 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                {/* Status Dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${group.isClosed ? 'bg-red-500' : 'bg-green-500'}`} />
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {isRange ? `${startStr} — ${endStr}` : new Date(group.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {isRange && (
                       <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                         {group.ids.length} Days
                       </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500 block mt-0.5">
                    {group.isClosed 
                      ? <span className="text-red-600 font-medium">Closed</span> 
                      : <span className="text-green-700 font-medium">Open {group.opensAt} - {group.closesAt}</span>
                    }
                    {group.note && <span className="ml-2 text-gray-400">• {group.note}</span>}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleBulkDelete(group.ids)}
                className="text-gray-300 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove Range"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}