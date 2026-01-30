"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

// Internal Component: A simple button to add a new location
function AddLocationButton() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!name) return;
    await fetch("/api/restaurant/locations", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setIsAdding(false);
    setName("");
    router.refresh();
  };

  if (isAdding) {
    return (
      <div className="flex gap-2 items-center">
        <input 
          autoFocus
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="New Location Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-black text-white px-3 py-1 rounded text-sm font-bold">Save</button>
        <button onClick={() => setIsAdding(false)} className="text-gray-500 text-sm">Cancel</button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setIsAdding(true)}
      className="text-sm font-bold text-blue-600 hover:text-blue-800"
    >
      + Add Location
    </button>
  );
}

// Main Component
export default function SettingsInterface({ restaurant, locations }: { restaurant: any, locations: any[] }) {
  const [activeTab, setActiveTab] = useState<"general" | "locations" | "support">("general");
  const router = useRouter();

  const deleteLocation = async (id: string) => {
    if(!confirm("Delete this location? This will delete all tables inside it.")) return;
    await fetch(`/api/restaurant/locations?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      
      {/* TABS NAVIGATION */}
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

      {/* TABS CONTENT */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        
        {/* --- TAB 1: GENERAL --- */}
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
                  value={restaurant?.name || ""} 
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
                    value={restaurant?.slug || ""}
                    className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-lg border-gray-300 bg-white text-gray-900 sm:text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: LOCATIONS --- */}
        {activeTab === "locations" && (
          <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
             <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-bold text-gray-900">Locations</h2>
                   <p className="text-sm text-gray-500">Manage distinct areas (e.g. Indoor, Terrace).</p>
                </div>
                <AddLocationButton />
             </div>
             
             <div className="grid gap-3">
               {locations && locations.map(loc => (
                  <div key={loc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all bg-gray-50/50">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-gray-200 rounded-md">
                           <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-bold text-gray-900">{loc.name}</span>
                     </div>
                     <button 
                        onClick={() => deleteLocation(loc.id)}
                        className="text-sm text-gray-400 hover:text-red-600 underline"
                      >
                        Remove
                      </button>
                  </div>
               ))}
               {(!locations || locations.length === 0) && (
                 <div className="text-center py-8 text-gray-400 italic">No locations yet. Add one!</div>
               )}
             </div>
          </div>
        )}

        {/* --- TAB 3: SUPPORT --- */}
        {activeTab === "support" && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
            <p className="text-gray-500">Contact support@argo.app</p>
          </div>
        )}

      </div>
    </div>
  );
}