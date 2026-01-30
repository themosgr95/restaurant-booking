"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function AddTableForm({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("2");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // We post to a nested route specific to this location
    const res = await fetch(`/api/restaurant/locations/${locationId}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, capacity: parseInt(capacity) }),
    });

    if (res.ok) {
      setName("");
      setCapacity("2");
      router.refresh(); // Refreshes the list below
    } else {
      alert("Failed to create table");
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Table</h3>
      <form onSubmit={handleSubmit} className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Table Name/Number</label>
          <input 
            type="text" 
            required
            placeholder="e.g. T1 or Window 4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm p-2"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-gray