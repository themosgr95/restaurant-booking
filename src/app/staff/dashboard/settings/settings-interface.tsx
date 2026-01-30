"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Trash2, Edit2, Check, X, Plus } from "lucide-react";
import AddLocationForm from "./locations/add-location-form";

export default function SettingsInterface({ restaurant, locations }: { restaurant: any, locations: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "locations">("general");
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  // Handlers
  const startEdit = (loc: any) => {
    setEditingId(loc.id);
    setEditName(loc.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    await fetch("/api/restaurant/locations", {
      method: "PATCH",
      body: JSON.stringify({ id, name: editName }),
    });
    setLoading(false);
    setEditingId(null);
    router.refresh();
  };

  const deleteLocation = async (id: string) => {
    if (!confirm("Are you sure? This will delete all tables and bookings associated with this location.")) return;
    setLoading(true);
    await fetch(`/api/restaurant/locations?id=${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
      
      {/* 1. Sidebar Tabs */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "general" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <User className="w-4 h-4" />
            General Profile
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "locations" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Locations
          </button>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 p-8">
        
        {/* TAB: GENERAL */}
        {activeTab === "general" && (
          <div className="max-w-md space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Restaurant Profile</h2>
              <p className="text-sm text-gray-500">Manage your public details.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input 
                  disabled 
                  value={restaurant.name} 
                  className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unique Slug</label>
                <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  argo-store.nl/book/<span className="text-black font-medium">{restaurant.slug}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LOCATIONS */}
        {activeTab === "locations" && (
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Locations</h2>
              <p className="text-sm text-gray-500">Add, rename, or remove areas (e.g. Indoor, Terrace).</p>
            </div>

            {/* List */}
            <div className="space-y-3">
              {locations.map((loc) => (
                <div key={loc.id} className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-all">
                  
                  {/* Edit Mode */}
                  {editingId === loc.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input 
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 border-gray-300 rounded-md text-sm p-2"
                      />
                      <button onClick={() => saveEdit(loc.id)} className="p-2 bg-black text-white rounded hover:bg-gray-800"><Check className="w-4 h-4"/></button>
                      <button onClick={cancelEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{loc.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(loc)}
                          disabled={loading}
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteLocation(loc.id)}
                          disabled={loading}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add New */}
            <div className="pt-6 border-t border-gray-100">
               <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add New Location
               </h3>
               <AddLocationForm />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}