import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Lock } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/staff");

  // Fetch minimal data for the timeline
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      
      {/* Header / Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Date Selector */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{today}</h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Today</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> New Booking
          </button>
          <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-sm transition-colors">
            <Lock className="w-4 h-4" /> Block Tables
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm">
            <CalendarIcon className="w-4 h-4" /> Calendar View
          </button>
        </div>
      </div>

      {/* The Timeline Canvas (Placeholder for now) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px] flex items-center justify-center">
        <div className="text-center p-8">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <CalendarIcon className="w-8 h-8 text-gray-300" />
           </div>
           <h3 className="text-gray-900 font-medium">No bookings for today</h3>
           <p className="text-gray-500 text-sm mt-1">Ready to accept reservations.</p>
        </div>
      </div>

    </div>
  );
}