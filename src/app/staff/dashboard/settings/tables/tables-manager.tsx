"use client";

import { useState } from "react";
import { MapPin, LayoutGrid } from "lucide-react";
import AddTableForm from "./add-table-form";
import TableListItem from "./table-list-item";

export default function TablesManager({ locations }: { locations: any[] }) {
  // Default to first location
  const [activeId, setActiveId] = useState(locations[0]?.id || "");
  const activeLocation = locations.find(l => l.id === activeId);

  if (!activeLocation) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white border border-dashed rounded-lg">
        Create a location in Settings first.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Tabs */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Location</h3>
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
              {activeId === loc.id && <div className="w-2 h-2 bg-emerald-400 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
           <LayoutGrid className="w-5 h-5 text-gray-500" />
           <h2 className="text-xl font-bold text-gray-900">Tables in {activeLocation.name}</h2>
        </div>

        {/* ⚠️ IMPORTANT: We pass the activeId to the form so it knows where to create the table */}
        <AddTableForm locationId={activeId} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeLocation.tables.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">
                    No tables in {activeLocation.name} yet. Add one above!
                  </td>
                </tr>
              ) : (
                activeLocation.tables.map((table: any) => (
                  <TableListItem key={table.id} table={table} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}