"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRestaurantModal() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/restaurant/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      router.refresh(); // Reloads the page to show the dashboard!
    } else {
      alert("Something went wrong. Try a different name.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            👋
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to Argo!</h2>
          <p className="text-sm text-gray-500 mt-1">Let's get your restaurant set up.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Restaurant Name</label>
            <input 
              type="text" 
              required
              autoFocus
              placeholder="e.g. The Greek Taverna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 text-lg"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !name}
            className="w-full bg-black text-white py-3 rounded-lg font-bold text-sm hover:bg-neutral-800 disabled:opacity-50 transition-all"
          >
            {loading ? "Setting up..." : "Create Dashboard →"}
          </button>
        </form>

      </div>
    </div>
  );
}