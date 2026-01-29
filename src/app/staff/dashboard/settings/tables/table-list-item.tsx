"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TableProps {
  table: {
    id: string;
    name: string;
    capacityMin: number;
    capacityMax: number;
  };
}

export default function TableListItem({ table }: TableProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit State
  const [name, setName] = useState(table.name);
  const [min, setMin] = useState(table.capacityMin);
  const [max, setMax] = useState(table.capacityMax);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    setIsLoading(true);
    await fetch(`/api/restaurant/tables?id=${table.id}`, { method: "DELETE" });
    router.refresh();
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    await fetch(`/api/restaurant/tables`, {
      method: "PATCH",
      body: JSON.stringify({ id: table.id, name, capacityMin: min, capacityMax: max }),
    });
    setIsEditing(false);
    router.refresh();
    setIsLoading(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-yellow-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full rounded border-gray-300 p-1 text-sm"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap flex gap-2 items-center">
          <input 
            type="number" 
            value={min} 
            onChange={(e) => setMin(Number(e.target.value))} 
            className="w-16 rounded border-gray-300 p-1 text-sm"
          />
          <span>-</span>
          <input 
            type="number" 
            value={max} 
            onChange={(e) => setMax(Number(e.target.value))} 
            className="w-16 rounded border-gray-300 p-1 text-sm"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="text-green-600 hover:text-green-900 font-bold"
          >
            Save
          </button>
          <button 
            onClick={() => setIsEditing(false)} 
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {table.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {table.capacityMin}-{table.capacityMax} people
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
        <button 
          onClick={() => setIsEditing(true)} 
          className="text-indigo-600 hover:text-indigo-900"
        >
          Edit
        </button>
        <button 
          onClick={handleDelete} 
          disabled={isLoading}
          className="text-red-600 hover:text-red-900"
        >
          {isLoading ? "..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}