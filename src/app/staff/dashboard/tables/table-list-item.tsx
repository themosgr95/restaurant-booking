"use client";

import { useState } from "react";
import { Trash2, Edit2, Check, X, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TableListItem({ table }: { table: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const [capacity, setCapacity] = useState(table.capacity);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch("/api/restaurant/locations/tables", { // We can reuse the patch logic if we make a general route, or just delete/re-create. 
      // For simplicity in this specific setup, let's assume we just want to VIEW/DELETE for now to fix the bug. 
      // If you need full edit capability, we can add that API later.
      // Let's stick to the requested fix: Display the number.
    });
    setLoading(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this table?")) return;
    setLoading(true);
    await fetch(`/api/restaurant/locations/any/tables?id=${table.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <tr>
      {/* Name Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
            {table.name.substring(0, 2)}
          </div>
          {table.name}
        </div>
      </td>

      {/* Capacity Column (FIXED) */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{table.capacity}</span>
          <span>ppl</span>
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          onClick={handleDelete}
          disabled={loading}
          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
        >
          {loading ? "..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}