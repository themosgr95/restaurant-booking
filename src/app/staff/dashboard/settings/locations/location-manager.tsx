"use client";

import { useState } from "react";
import { MapPin, Clock, CalendarDays } from "lucide-react";
import HoursForm from "./[locationId]/hours-form";
import ClosuresForm from "./[locationId]/closures-form";

interface LocationData {
  id: string;
  name: string;
  openingHours: any[];
  specialClosures: any[];
}

export default function LocationManager({ locations }: { locations: LocationData[] }) {
  // Default to the first location
  const [activeId, setActiveId] = useState(locations[0]?.id || "");
  
  const activeLocation = locations.find(l => l.id === activeId);

  if (!activeLocation) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed">
        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No locations found.</p>
        <p className="text-sm text-gray-400">Go to General Settings to create one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* LEFT: Sidebar / Tabs */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
          Select Location
        </h3>
        <div className="space-y-1">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveId(loc.id)}
              className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center justify-between ${
                activeId === loc.id
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              <span>{loc.name}</span>
              {activeId === loc.id && <div className="w-2 h-2 bg-green-400 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Content Area */}
      <div className="flex-1 space-y-8">
        
        {/* Header for Active Location */}
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <MapPin className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">{activeLocation.name}</h2>
        </div>

        {/* 1. Weekly Schedule */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-900" />
            <h3 className="text-lg font-bold text-gray-900">Weekly Schedule</h3>
          </div>
          <HoursForm 
            key={`${activeId}-hours`} // Force re-render when switching tabs
            locationId={activeId} 
            initialData={activeLocation.openingHours} 
          />
        </section>

        {/* 2. Special Closures */}
        <section>
          {/* ClosuresForm handles its own header, so we just pass data */}
          <ClosuresForm 
            key={`${activeId}-closures`}
            locationId={activeId} 
            closures={activeLocation.specialClosures} 
          />
        </section>

      </div>
    </div>
  );
}