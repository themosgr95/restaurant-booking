"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Users, Square, Circle } from "lucide-react";

interface Location {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: "RECTANGLE" | "ROUND"; // We can assume these shapes
}

export default function TablesSettingsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [tables, setTables] = useState<Table[]>([]);
  
  // New Table Form State
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");
  const [newTableShape, setNewTableShape] = useState("RECTANGLE");
  const [loading, setLoading] = useState(false);

  // 1. Fetch Locations on Load
  useEffect(() => {
    async function fetchLocations() {
      try {
        // We need an endpoint to get user's locations. 
        // If you don't have one, we can mock it or you can use your existing one.
        // For now, let's assume this exists or use a temporary mock if it fails.
        const res = await fetch("/api/restaurant/list"); 
        if (res.ok) {
            const data = await res.json();
            setLocations(data.locations || []);
            if (data.locations?.[0]) setSelectedLocation(data.locations[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch locations");
      }
    }
    fetchLocations();
  }, []);

  // 2. Fetch Tables when Location Changes
  useEffect(() => {
    if (!selectedLocation) return;
    async function fetchTables() {
      const res = await fetch(`/api/tables?locationId=${selectedLocation}`);
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables);
      }
    }
    fetchTables();
  }, [selectedLocation]);

  // 3. Handle Add Table
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return alert("Please select a location first");
    
    setLoading(true);
    const res = await fetch("/api/tables/create", {
      method: "POST",
      body: JSON.stringify({
        name: newTableName,
        capacity: parseInt(newTableCapacity),
        locationId: selectedLocation,
        shape: newTableShape // Only if your DB supports it, otherwise it ignores it
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setTables([...tables, data.table]); // Add to list immediately
      setNewTableName(""); // Reset form
    } else {
      alert("Failed to create table");
    }
    setLoading(false);
  };

  // 4. Handle Delete Table
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this table?")) return;
    const res = await fetch(`/api/tables?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setTables(tables.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      
      {/* --- Header & Location Selector --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Restaurant Tables</h2>
          <p className="text-gray-500 text-sm">Manage your floor plan capacity.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 border rounded-lg shadow-sm">
            <span className="text-sm font-medium text-gray-500 pl-2">Location:</span>
            <select 
                className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
            >
                {locations.length === 0 && <option>Loading locations...</option>}
                {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* --- Add Table Card --- */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add New Table
        </h3>
        <form onSubmit={handleAddTable} className="flex flex-wrap items-end gap-4">
            
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Table Name/Number</label>
                <input 
                    type="text" 
                    placeholder="e.g. Table 12 or Window Seat" 
                    className="w-full p-2.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    required
                />
            </div>

            <div className="w-32">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Capacity</label>
                <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="number" 
                        min="1"
                        className="w-full p-2.5 pl-9 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newTableCapacity}
                        onChange={(e) => setNewTableCapacity(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="w-32">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Shape</label>
                <select 
                    className="w-full p-2.5 rounded-lg border border-blue-200 bg-white"
                    value={newTableShape}
                    onChange={(e) => setNewTableShape(e.target.value)}
                >
                    <option value="RECTANGLE">Square</option>
                    <option value="ROUND">Round</option>
                </select>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            >
                {loading ? "Adding..." : "Add Table"}
            </button>
        </form>
      </div>

      {/* --- Tables Grid --- */}
      {tables.length === 0 ? (
         <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-medium">No tables found. Add your first one above!</p>
         </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
                <div key={table.id} className="group relative bg-white border border-gray-200 hover:border-blue-400 p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                    
                    {/* Visual Icon */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-full text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                        {table.shape === "ROUND" ? <Circle size={32} /> : <Square size={32} />}
                    </div>

                    <h4 className="font-bold text-lg text-gray-900">{table.name}</h4>
                    <span className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Users size={14} /> {table.capacity} Seats
                    </span>

                    {/* Delete Button (Hidden until hover) */}
                    <button 
                        onClick={() => handleDelete(table.id)}
                        className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Table"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}