"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTableForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [min, setMin] = useState("2");
  const [max, setMax] = useState("4");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/restaurant/tables", {
      method: "POST",
      body: JSON.stringify({ name, capacityMin: min, capacityMax: max }),
    });

    setLoading(false);
    setName(""); // Clear the form
    router.refresh(); // Refresh the list automatically
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">Add New Table</h3>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Table Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Table 5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm"
          />
        </div>
        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700">Min Seats</label>
          <input
            type="number"
            required
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm"
          />
        </div>
        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700">Max Seats</label>
          <input
            type="number"
            required
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}