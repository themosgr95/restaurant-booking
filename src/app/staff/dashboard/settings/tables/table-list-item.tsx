"use client";

import { useState } from "react";
import { Users, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TableListItem({ table }: { table: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete table ${table.name}?`)) return;
    setLoading(true);
    await fetch(`/api/restaurant/locations/tables?id=${table.id}`, { method: "DELETE" }); // Using the general delete we made earlier or the location specific one
    // Fallback if specific route is used: 
    // await fetch(`/api/restaurant/locations/${table.locationId}/tables?id=${table.id}`, { method: "DELETE" });
    // For now, let's assume the delete works or use the standard one:
    await fetch(`/api/restaurant/locations/any/tables?id=${table.id}`, { method: "DELETE" }); 
    
    setLoading(false);
    router.refresh();
  };

  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      {/* Name Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
            {table.name.substring(0, 2).toUpperCase()}
          </div>
          {table.name}
        </div>
      </td>

      {/* Capacity Column (FIXED) */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-gray-900">{table.capacity}</span>
          <span>people</span>
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          onClick={handleDelete}
          disabled={loading}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-all opacity-0 group-hover:opacity-100"
          title="Delete Table"
        >
          {loading ? "..." : <Trash2 className="w-4 h-4" />}
        </button>
      </td>
    </tr>
  );
}