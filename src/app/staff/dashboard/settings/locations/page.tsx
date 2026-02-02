"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Edit2, Check, X, Clock } from "lucide-react";

interface Location {
  id: string;
  name: string;
  turnoverTime: number;
}

export default function LocationsSettingsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for adding new location
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTurnover, setNewTurnover] = useState("90");

  // State for editing existing location
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTurnover, setEditTurnover] = useState("");

  // 1. Fetch Locations
  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const res = await fetch("/api/restaurant/list");
      const data = await res.json();
      setLocations(data.locations || []);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load locations");
    }
  }

  // 2. Add Location
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/restaurant/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, turnoverTime: parseInt(newTurnover) }),
    });

    if (res.ok) {
      fetchLocations();
      setIsAdding(false);
      setNewName("");
      setNewTurnover("90");
    }
  };

  // 3. Update Location (Save Edits)
  const handleUpdate = async (id: string) => {
    // We update both name and turnover. 
    // Ideally create a generic update endpoint, or we use the specific turnover endpoint + a rename endpoint.
    // For simplicity, let's assume we use the generic location update logic (PUT) we discussed earlier.
    
    // First, update basic info (Name)
    // Note: If you don't have a specific "Rename" API, this might fail unless you create it.
    // Assuming you have src/app/api/restaurant/locations/[locationId]/route.ts for PUT/DELETE
    const res = await fetch(`/api/restaurant/locations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, turnoverTime: parseInt(editTurnover) }),
    });

    if (res.ok) {
        // Update local state to reflect changes instantly
        setLocations(locations.map(loc => 
            loc.id === id ? { ...loc, name: editName, turnoverTime: parseInt(editTurnover) } : loc
        ));
        setEditingId(null);
    } else {
        alert("Failed to update location");
    }
  };

  // 4. Delete Location
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location? This will remove all tables associated with it.")) return;
    
    const res = await fetch(`/api/restaurant/locations/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setLocations(locations.filter(l => l.id !== id));
    } else {
      alert("Error deleting location");
    }
  };

  // Helper to start editing
  const startEditing = (loc: Location) => {
      setEditingId(loc.id);
      setEditName(loc.name);
      setEditTurnover(loc.turnoverTime.toString());
  };

  if (loading) return <div className="p-8 text-gray-400">Loading locations...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-100 rounded-full text-gray-600">
            <MapPin size={24} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-900">Locations</h2>
            <p className="text-gray-500 text-sm">Add and manage restaurant areas.</p>
        </div>
      </div>

      {/* --- Existing Locations List --- */}
      <div className="space-y-4">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            
            {editingId === loc.id ? (
                // --- EDIT MODE ---
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                        <input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-black focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Turnover (Min)</label>
                        <input 
                            type="number"
                            value={editTurnover}
                            onChange={(e) => setEditTurnover(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-black focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => handleUpdate(loc.id)} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                            <Check size={16} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50">
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                // --- VIEW MODE ---
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{loc.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 font-medium">
                            <Clock size={14} /> {loc.turnoverTime} min turnover
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => startEditing(loc)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(loc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* --- Add New Location Button/Form --- */}
      {isAdding ? (
        <div className="bg-white border-2 border-dashed border-blue-200 rounded-xl p-6 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold text-blue-900 mb-4">New Location</h3>
            <form onSubmit={handleAdd} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Location Name</label>
                    <input 
                        placeholder="e.g. Main Restaurant, Garden, Bar"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-3 border border-blue-100 bg-blue-50/30 rounded-lg font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                        autoFocus
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Turnover Time (minutes)</label>
                    <input 
                        type="number"
                        value={newTurnover}
                        onChange={(e) => setNewTurnover(e.target.value)}
                        className="w-full p-3 border border-blue-100 bg-blue-50/30 rounded-lg font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition-colors">
                        + Add Location
                    </button>
                    <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 px-4 py-2.5 font-bold text-sm hover:text-gray-700">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
      ) : (
        <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
            <Plus size={20} /> Add Location
        </button>
      )}

    </div>
  );
}