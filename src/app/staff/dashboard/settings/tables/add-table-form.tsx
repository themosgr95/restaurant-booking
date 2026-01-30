"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Users } from "lucide-react";

export default function AddTableForm({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(2); // Number, not string

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/restaurant/locations/${locationId}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, capacity }),
    });

    if (res.ok) {
      setName("");
      setCapacity(2);
      router.refresh();
    } else {
      alert("Failed to create table");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Table</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
        
        {/* Name Input */}
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-gray-500 mb-1">Table Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. T1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm p-2.5"
          />
        </div>

        {/* Capacity Selector (New "Choose" UI) */}
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-bold text-gray-500 mb-1">Capacity</label>
          <div className="flex items-center border border-gray-300 rounded-md bg-white">
            <button 
              type="button"
              onClick={() => setCapacity(Math.max(1, capacity - 1))}
              className="p-2.5 hover:bg-gray-50 text-gray-600 border-r border-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-12 text-center font-bold text-gray-900 text-sm flex items-center justify-center gap-1">
              <span>{capacity}</span>
              <Users className="w-3 h-3 text-gray-400" />
            </div>
            <button 
              type="button"
              onClick={() => setCapacity(Math.min(20, capacity + 1))}
              className="p-2.5 hover:bg-gray-50 text-gray-600 border-l border-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || !locationId || !name}
          className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-md text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Adding..." : <><Plus className="w-4 h-4" /> Create Table</>}
        </button>
      </form>
    </div>
  );
}