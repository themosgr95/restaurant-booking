"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Users, Square, Edit2, X } from "lucide-react";

interface Table {
  id: string;
  name: string;
  capacity: number;
  locationId: string;
}

interface Location {
  id: string;
  name: string;
}

export default function TableManagerPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [tables, setTables] = useState<Table[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ name: "", capacity: "4" });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/restaurant/list");
        const data = await res.json();
        if (data.locations?.length > 0) {
          setLocations(data.locations);
          setSelectedLocation(data.locations[0].id);
        }
      } catch (e) { console.error("Failed to load locations"); }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;
    fetch(`/api/tables?locationId=${selectedLocation}`)
      .then(res => res.json())
      .then(data => setTables(data.tables || []));
  }, [selectedLocation]);

  const openModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({ name: table.name, capacity: table.capacity.toString() });
    } else {
      setEditingTable(null);
      setFormData({ name: "", capacity: "4" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity),
      locationId: selectedLocation,
      id: editingTable?.id
    };

    const url = editingTable ? "/api/tables" : "/api/tables/create"; 
    const method = editingTable ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsModalOpen(false);
      // Refresh list
      const updated = await fetch(`/api/tables?locationId=${selectedLocation}`).then(r => r.json());
      setTables(updated.tables);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this table?")) return;
    await fetch(`/api/tables?id=${id}`, { method: "DELETE" });
    setTables(tables.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Floor Plan</h1>
        {locations.length > 0 && (
          <select 
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold cursor-pointer"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Add Button */}
        <button onClick={() => openModal()} className="h-40 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center text-blue-600 font-bold transition-all">
          <Plus size={32} className="mb-2" />
          Add Table
        </button>

        {/* Table Cards */}
        {tables.map((table) => (
          <div key={table.id} className="relative group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md h-40 flex flex-col items-center justify-center">
            <Square size={32} className="text-gray-400 mb-2" />
            <h3 className="font-bold text-lg">{table.name}</h3>
            <span className="text-sm text-gray-500 flex items-center gap-1">
               <Users size={14} /> {table.capacity}
            </span>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => { e.stopPropagation(); openModal(table); }} className="p-2 hover:bg-blue-100 rounded-full"><Edit2 size={14} /></button>
               <button onClick={(e) => { e.stopPropagation(); handleDelete(table.id); }} className="p-2 hover:bg-red-100 rounded-full"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between p-5 border-b">
               <h2 className="font-bold text-lg">{editingTable ? "Edit Table" : "New Table"}</h2>
               <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                  <input type="text" required className="w-full p-3 bg-gray-50 border rounded-xl font-medium" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                  <input type="number" required min="1" className="w-full p-3 bg-gray-50 border rounded-xl font-medium" 
                    value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
               </div>
               <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-xl mt-2">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}