"use client";

import { useState } from "react";
import { Save, Clock, MapPin, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsView({ locations }: { locations: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newLocName, setNewLocName] = useState("");
  
  // Local state to manage inputs before saving
  const [updates, setUpdates] = useState<{ [key: string]: number }>({});

  const handleUpdateTurnover = async (locationId: string, currentVal: number) => {
    const newVal = updates[locationId];
    if (newVal === undefined || newVal === currentVal) return; // No change

    setLoadingId(locationId);
    
    try {
      const res = await fetch(`/api/restaurant/locations/${locationId}/turnover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoverTime: newVal })
      });
      
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      alert("Failed to save");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocName) return;
    await fetch("/api/restaurant/locations", {
      method: "POST", 
      body: JSON.stringify({ name: newLocName })
    });
    setNewLocName("");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this location? All tables and bookings in it will be lost.")) return;
    await fetch(`/api/restaurant/locations?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-2">Location Management</h2>
        <p className="text-gray-500 text-sm">
          Define your restaurant areas and how long guests usually stay (Eating Time).
          This "Turnover Time" tells the <strong>Ding! Wizard</strong> when to unlock the table for the next guest.
        </p>
      </div>

      {/* List of Locations */}
      <div className="grid gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4 transition-all hover:border-orange-200">
            
            {/* Icon & Name */}
            <div className="flex items-center gap-3 flex-1 w-full">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{loc.name}</div>
                <div className="text-xs text-gray-400 font-mono">{loc.id}</div>
              </div>
            </div>

            {/* Turnover Control */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg w-full md:w-auto">
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Eating Time</label>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    min="15"
                    max="300"
                    placeholder={loc.turnoverTime || 90}
                    value={updates[loc.id] ?? loc.turnoverTime ?? 90}
                    onChange={(e) => setUpdates({ ...updates, [loc.id]: parseInt(e.target.value) })}
                    className="bg-transparent font-bold text-gray-900 w-12 outline-none border-b border-gray-300 focus:border-orange-500"
                  />
                  <span className="text-xs font-bold text-gray-500">min</span>
                </div>
              </div>
              
              {/* Save Button (Only appears if changed) */}
              {(updates[loc.id] !== undefined && updates[loc.id] !== loc.turnoverTime) && (
                <button 
                  onClick={() => handleUpdateTurnover(loc.id, loc.turnoverTime)}
                  disabled={loadingId === loc.id}
                  className="ml-2 bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {loadingId === loc.id ? <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> : <Save className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Delete */}
            <button onClick={() => handleDelete(loc.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>

          </div>
        ))}
      </div>

      {/* Add New Location */}
      <div className="flex items-center gap-2 mt-4 bg-gray-100 p-2 rounded-xl border border-dashed border-gray-300">
         <div className="w-10 h-10 flex items-center justify-center text-gray-400">
            <Plus className="w-5 h-5" />
         </div>
         <input 
           placeholder="Add new area name (e.g. Garden)..." 
           className="bg-transparent flex-1 font-bold outline-none text-gray-700"
           value={newLocName}
           onChange={(e) => setNewLocName(e.target.value)}
           onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
         />
         <button 
           disabled={!newLocName}
           onClick={handleAddLocation}
           className="px-4 py-2 bg-black text-white rounded-lg font-bold text-sm disabled:opacity-50"
         >
           Add
         </button>
      </div>

    </div>
  );
}