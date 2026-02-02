"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Edit2, Check, X, Clock, AlertCircle } from "lucide-react";

interface Location {
  id: string;
  name: string;
  turnoverTime: number;
}

export default function LocationsSettingsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Mode State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTurnover, setNewTurnover] = useState("90");

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTurnover, setEditTurnover] = useState("");

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

  // --- ACTIONS ---

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/restaurant/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, turnoverTime: parseInt(newTurnover) }),
    });

    if (res.ok) {
      fetchLocations(); // Refresh list
      setIsAdding(false); // Close form
      setNewName("");
      setNewTurnover("90");
    }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/restaurant/locations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, turnoverTime: parseInt(editTurnover) }),
    });

    if (res.ok) {
        setLocations(locations.map(loc => 
            loc.id === id ? { ...loc, name: editName, turnoverTime: parseInt(editTurnover) } : loc
        ));
        setEditingId(null);
    } else {
        alert("Failed to update location");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the location and all its tables.")) return;
    
    const res = await fetch(`/api/restaurant/locations/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setLocations(locations.filter(l => l.id !== id));
    } else {
      alert("Failed to delete. Make sure there are no active bookings linked to this location.");
    }
  };

  const startEditing = (loc: Location) => {
      setEditingId(loc.id);
      setEditName(loc.name);
      setEditTurnover(loc.turnoverTime.toString());
  };

  if (loading) return <div className="p-8 text-gray-400">Loading locations...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-50 rounded-full text-gray-400 border border-gray-100">
            <MapPin size={24} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-900">Locations</h2>
            <p className="text-gray-500 text-sm">Create areas like Main Restaurant, Bar, or Garden.</p>
        </div>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.length === 0 && !isAdding && (
             <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                 No locations found. Add your first one below.
             </div>
        )}

        {locations.map((loc) => (
          <div key={loc.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
            
            {editingId === loc.id ? (
                // --- EDIT MODE ---
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Name</label>
                            <input 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full p-2 border-b-2 border-black bg-transparent font-bold text-lg focus:outline-none"
                                autoFocus
                            />
                        </div>
                        <div className="w-32">
                             <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Turnover (min)</label>
                             <input 
                                type="number"
                                value={editTurnover}
                                onChange={(e) => setEditTurnover(e.target.value)}
                                className="w-full p-2 border-b-2 border-gray-200 focus:border-black bg-transparent font-bold text-lg focus:outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => handleUpdate(loc.id)} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-800">
                            Save Changes
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-500 font-bold text-sm hover:text-black">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                // --- VIEW MODE ---
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{loc.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Clock size={14} className="text-gray-400" /> 
                            <span className="font-medium">{loc.turnoverTime} min</span> turnover time
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => startEditing(loc)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit Location"
                        >
                            <Edit2 size={18} />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <button 
                            onClick={() => handleDelete(loc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Location"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Button / Form */}
      {isAdding ? (
        <div className="bg-white border border-blue-100 shadow-lg shadow-blue-50/50 rounded-xl p-6 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> New Location
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
                <div>
                    <input 
                        placeholder="Location Name (e.g. Patio)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        autoFocus
                        required
                    />
                </div>
                <div>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400 text-sm font-medium">Turnover:</span>
                        <input 
                            type="number"
                            value={newTurnover}
                            onChange={(e) => setNewTurnover(e.target.value)}
                            className="w-full p-3 pl-24 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                            required
                        />
                        <span className="absolute right-3 top-3 text-gray-400 text-sm font-medium">min</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 pl-1">How long a table stays occupied normally.</p>
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition-colors">
                        Add Location
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
            className="w-full py-4 border border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
            <Plus size={20} /> Add Location
        </button>
      )}

    </div>
  );
}