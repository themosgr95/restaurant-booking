"use client";

import { useState } from "react";
import { Calendar, Users, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import StaffBookingWizard from "./booking-wizard";

export default function TimelineView({ 
  locations, 
  bookings 
}: { 
  locations: any[], 
  bookings: any[] 
}) {
  const [activeLocationId, setActiveLocationId] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // --- FILTER LOGIC ---
  // If "all" is selected, show everything. Otherwise, filter bookings that have at least one table in the active location.
  const filteredBookings = activeLocationId === "all"
    ? bookings
    : bookings.filter(b => b.tables.some((t: any) => t.locationId === activeLocationId));

  // Calculate total guests for the current view
  const totalGuests = filteredBookings.reduce((sum: number, b: any) => sum + b.guests, 0);

  return (
    <div className="space-y-6">
      
      {/* --- POPUP WIZARD --- */}
      {/* UPDATED: Now passing 'locations' so Step 1 dropdown works */}
      {showWizard && (
        <StaffBookingWizard 
          locations={locations} 
          onClose={() => setShowWizard(false)} 
        />
      )}

      {/* --- CONTROL BAR --- */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Left: Date & Total Count */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft className="w-5 h-5"/></button>
             <div>
               <h2 className="text-lg font-bold text-gray-900 leading-none">{today}</h2>
               <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-1">Today</p>
             </div>
             <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight className="w-5 h-5"/></button>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

          {/* TOTAL COUNTER */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <div className="text-center">
              <span className="block text-xl font-black text-gray-900 leading-none">{filteredBookings.length}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Bookings</span>
            </div>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-gray-900 leading-none">{totalGuests}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Guests</span>
            </div>
          </div>
        </div>

        {/* Middle: LOCATION TABS */}
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveLocationId("all")}
            className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all ${
              activeLocationId === "all" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All Areas
          </button>
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setActiveLocationId(loc.id)}
              className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeLocationId === loc.id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>{loc.name}</span>
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowWizard(true)}
             className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 shadow-sm whitespace-nowrap transition-transform active:scale-95"
           >
             <Plus className="w-4 h-4" /> New Booking
           </button>
        </div>
      </div>

      {/* --- TIMELINE CONTENT --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[500px]">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Calendar className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-gray-900 font-medium">
               No bookings for {activeLocationId === 'all' ? 'today' : locations.find(l => l.id === activeLocationId)?.name}
             </h3>
             <p className="text-gray-500 text-sm mt-1">Ready to accept reservations.</p>
          </div>
        ) : (
          <div className="p-4 grid gap-3">
            {filteredBookings.map((booking: any) => (
              <div key={booking.id} className="p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-all flex justify-between items-center group">
                <div className="flex items-center gap-4">
                   <div className="bg-gray-100 px-3 py-1 rounded text-sm font-bold text-gray-900">
                     {booking.time}
                   </div>
                   <div>
                     <div className="font-bold text-gray-900">{booking.customerName}</div>
                     <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {booking.guests} Guests • {booking.tables.map((t:any) => t.name).join(", ")}
                     </div>
                   </div>
                </div>
                {/* Status Indicator (Optional Placeholder) */}
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                  Confirmed
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}