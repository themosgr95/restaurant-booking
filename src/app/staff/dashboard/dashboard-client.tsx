"use client";

import { useState } from "react";
import { LayoutDashboard, Settings, LogOut, Armchair, Clock } from "lucide-react";
import { signOut } from "next-auth/react";
import TimelineView from "./timeline-view";
import SettingsView from "./settings-view";
import TablesView from "./tables-view"; // Import the new view

// Props Interface
interface DashboardProps {
  locations: any[];
  bookings: any[];
  currentDate: string;
}

export default function DashboardClient({ locations, bookings, currentDate }: DashboardProps) {
  // Add 'tables' and 'hours' to the allowed tabs
  const [activeTab, setActiveTab] = useState<"timeline" | "tables" | "hours" | "settings">("timeline");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shrink-0 h-auto md:h-screen sticky top-0">
        <div className="mb-8 px-2 flex items-center gap-2 pt-2">
           <div className="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center font-black italic">D!</div>
           <span className="font-black text-xl tracking-tighter">Ding!</span>
        </div>

        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab("timeline")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === "timeline" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Timeline
          </button>

          <button 
            onClick={() => setActiveTab("tables")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === "tables" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Armchair className="w-5 h-5" />
            Tables
          </button>

          <button 
            onClick={() => setActiveTab("hours")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === "hours" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Clock className="w-5 h-5" />
            Hours
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === "settings" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

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

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-theme(spacing.16))] md:h-screen">
         {activeTab === "timeline" && (
           <TimelineView locations={locations} bookings={bookings} dateStr={currentDate} />
         )}

         {activeTab === "tables" && (
           <TablesView locations={locations} />
         )}

         {/* Placeholder for Hours if needed later */}
         {activeTab === "hours" && (
            <div className="text-center text-gray-400 mt-20 font-bold">Hours Management Coming Soon...</div>
         )}

         {activeTab === "settings" && (
           <SettingsView locations={locations} />
         )}
      </main>

    </div>
  );
}