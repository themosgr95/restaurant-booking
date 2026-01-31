"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";

export default function SetupAdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/setup", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      router.refresh();
      router.push("/staff/dashboard");
    } else {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Setup Restaurant</h1>
        <p className="text-gray-500 mb-8">Give your new workspace a name to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Restaurant Name</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mario's Pizza"
              className="w-full mt-1 p-4 border-2 border-gray-100 rounded-xl font-bold focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <button 
            disabled={!name || loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            {loading ? "Setting up..." : "Create Workspace"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}