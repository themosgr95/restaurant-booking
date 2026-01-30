"use client";

import { useState } from "react";
import { MapPin, Trash2, Edit2, Check, X, Plus, Info, Globe, LifeBuoy } from "lucide-react";
import AddLocationForm from "./locations/add-location-form";
import { useRouter } from "next/navigation";

export default function SettingsInterface({ restaurant, locations }: { restaurant: any, locations: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "locations" | "support">("general");
  
  // Edit logic remains same as before...
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  // ... (Keep your startEdit, saveEdit, deleteLocation functions exactly as they were) ...
  // [I will compress them here for brevity, paste your existing logic back if needed]
  const startEdit = (loc: any) => { setEditingId(loc.id); setEditName(loc.name); };
  const cancelEdit = () => { setEditingId(null); };
  const saveEdit = async (id: string) => { /* ... */ };
  const deleteLocation = async (id: string) => { /* ... */ };


  return (
    <div className="space-y-6">
      
      {/* SUB-TABS (Horizontal) */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "general"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("locations")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "locations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "support"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Support
          </button>
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Restaurant Settings</h2>
              <p className="text-sm text-gray-500">Manage basic information.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name</label>
                <input 
                  disabled 
                  value={restaurant.name} 
                  className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-600 px-4 py-2.5 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Booking URL</label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    https://argo.app/book/
                  </span>
                  <input
                    type="text"
                    disabled
                    value={restaurant.slug}
                    className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-lg border-gray-300 bg-white text-gray-900 sm:text-sm font-medium"
                  />
                  <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={4}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                  placeholder="Tell your customers about your restaurant..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCATIONS */}
        {activeTab === "locations" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
             {/* Keep your existing Locations List Logic Here */}
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-bold text-gray-900">Locations</h2>
                   <p className="text-sm text-gray-500">Manage distinct areas.</p>
                </div>
                <AddLocationForm />
             </div>
             
             <div className="grid gap-3">
               {locations.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all bg-gray-50/50">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                           <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-bold text-gray-900">{loc.name}</span>
                     </div>
                     {/* Actions (Edit/Delete) go here */}
                     <button className="text-sm text-gray-400 hover:text-red-600">Remove</button>
                  </div>
               ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}