"use client";

import { useState } from "react";
import { Plus, Users, Armchair, MapPin, MoreHorizontal, Trash2, Pencil } from "lucide-react";

export default function TablesView({ locations }: { locations: any[] }) {
  const [activeLocationId, setActiveLocationId] = useState(locations[0]?.id || "");
  const activeLocation = locations.find(l => l.id === activeLocationId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tight">Floor Plan</h1>
           <p className="text-sm font-medium text-gray-500">Manage your seating layout and capacities.</p>
        </div>
        <button className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2">
           <Plus className="w-4 h-4" /> Add Table
        </button>
      </div>

      {/* LOCATION TABS (Pill Style) */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200 inline-flex shadow-sm">
        {locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => setActiveLocationId(loc.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeLocationId === loc.id 
              ? "bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200" 
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
         {/* Add New Card (Visual placeholder) */}
         <button className="group border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-orange-300 hover:bg-orange-50/50 transition-all h-40">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
               <Plus className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
            </div>
            <span className="text-xs font-bold text-gray-400 group-hover:text-orange-600">New Table</span>
         </button>

         {/* Existing Tables */}
         {activeLocation?.tables?.map((table: any) => (
            <div key={table.id} className="bg-white border border-gray-200 rounded-2xl p-5 relative group hover:shadow-md transition-all hover:border-gray-300 h-40 flex flex-col justify-between">
               
               {/* Top Row */}
               <div className="flex justify-between items-start">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                     <Armchair className="w-4 h-4" />
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-all">
                     <MoreHorizontal className="w-4 h-4" />
                  </button>
               </div>

               {/* Middle (Name) */}
               <div>
                  <h3 className="text-xl font-black text-gray-900 leading-none">{table.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Standard</p>
               </div>

               {/* Bottom (Capacity) */}
               <div className="flex items-center gap-1.5 bg-gray-50 w-fit px-2 py-1 rounded-md">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-bold text-gray-700">{table.capacity} Seats</span>
               </div>

               {/* Hidden Actions overlay (Optional polish) */}
               <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl z-10 pointer-events-none group-hover:pointer-events-auto">
                   <button className="p-2 bg-white border shadow-sm rounded-xl hover:text-blue-600 hover:border-blue-200"><Pencil className="w-4 h-4"/></button>
                   <button className="p-2 bg-white border shadow-sm rounded-xl hover:text-red-600 hover:border-red-200"><Trash2 className="w-4 h-4"/></button>
               </div>
            </div>
         ))}
      </div>
      
      {/* Empty State */}
      {(!activeLocation?.tables || activeLocation.tables.length === 0) && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
           <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
           <h3 className="font-bold text-gray-900">No tables in {activeLocation?.name}</h3>
           <p className="text-sm text-gray-500 mb-4">Start by adding your first table to this area.</p>
           <button className="text-orange-600 font-bold text-sm hover:underline">Add Table Now</button>
        </div>
      )}

    </div>
  );
}