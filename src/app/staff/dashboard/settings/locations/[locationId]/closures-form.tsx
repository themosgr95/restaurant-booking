"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClosuresForm({ locationId, closures }: { locationId: string, closures: any[] }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/restaurant/locations/${locationId}/closures`, {
      method: "POST",
      body: JSON.stringify({ date, note }),
    });
    setLoading(false);
    setDate("");
    setNote("");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Remove this holiday?")) return;
    await fetch(`/api/restaurant/locations/${locationId}/closures?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Special Closures (Holidays)</h2>
      
      {/* Add New Form */}
      <form onSubmit={handleAdd} className="flex gap-4 items-end mb-6 p-4 bg-gray-50 rounded">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input 
            type="date" 
            required 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border-gray-300 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Note (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Christmas Day"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded border-gray-300 text-sm"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-3 py-2 rounded text-sm font-semibold"
        >
          Add
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {closures.length === 0 && <p className="text-sm text-gray-400">No special closures added.</p>}
        {closures.map((c) => (
          <div key={c.id} className="flex justify-between items-center border-b pb-2 last:border-0">
            <div>
              <span className="font-medium text-gray-900 block">
                {new Date(c.date).toLocaleDateString()}
              </span>
              {c.note && <span className="text-sm text-gray-500">{c.note}</span>}
            </div>
            <button 
              onClick={() => handleDelete(c.id)}
              className="text-red-600 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}