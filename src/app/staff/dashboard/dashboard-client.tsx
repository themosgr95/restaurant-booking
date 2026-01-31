"use client";

import { useState } from "react";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import TimelineView from "./timeline-view";
import SettingsView from "./settings-view";

export default function DashboardClient({ locations, bookings, currentDate }: { locations: any[], bookings: any[], currentDate: string }) {
  const [activeTab, setActiveTab] = useState<"timeline" | "settings">("timeline");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2">
        <div className="mb-8 px-2 flex items-center gap-2">
           <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-black italic">D!</div>
           <span className="font-black text-xl tracking-tighter">Ding!</span>
        </div>

        <button 
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "timeline" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Timeline
        </button>

        <button 
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === "settings" ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>

        <div className="mt-auto pt-4 border-t border-gray-100">
           <button 
             onClick={() => signOut()}
             className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 w-full text-left transition-all"
           >
             <LogOut className="w-5 h-5" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
         {activeTab === "timeline" && (
           <TimelineView 
              locations={locations} 
              bookings={bookings}
              dateStr={currentDate} // Passing the date down correctly
           />
         )}

         {activeTab === "settings" && (
           <SettingsView locations={locations} />
         )}
      </main>

    </div>
  );
}