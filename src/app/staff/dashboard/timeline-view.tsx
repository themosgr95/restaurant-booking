"use client";

import { useState } from "react";
import { Calendar, Users, ChevronLeft, ChevronRight, Plus, CheckCircle } from "lucide-react";
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

  // Filter logic based on the selected Location Tab
  const filteredBookings = activeLocationId === "all"
    ? bookings
    : bookings.filter(b => b.tables.some((t: any) => t.locationId === activeLocationId));

  const totalGuests = filteredBookings.reduce((sum: number, b: any) => sum + b.guests, 0);

  return (
    <div className="space-y-6">
      
      {/* Smart Booking Wizard */}
      {showWizard && (
        <StaffBookingWizard 
          locations={locations} 
          onClose={() => setShowWizard(false)} 
        />
      )}

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Left: Date & Counter */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft className="w-5 h-5"/></button>
             <div>
               <h2 className="text-lg font-bold text-gray-900 leading-none">{today}</h2>
               <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-1">Today</p>
             </div>
             <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight className="w-5 h-5"/></button>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <div className="text-center">
              <span className="block text-xl font-black text-gray-900 leading-none">{filteredBookings.length}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Bookings</span>
            </div>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-gray-900 leading-none">{totalGuests}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Guests</span>
            </div>
          </div>
        </div>

        {/* Middle: Location Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveLocationId("all")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              activeLocationId === "all" ? "bg-white text-black shadow-sm" : "text-gray-500"
            }`}
          >
            All Areas
          </button>
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => setActiveLocationId(loc.id)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeLocationId === loc.id ? "bg-white text-black shadow-sm" : "text-gray-500"
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Right: New Booking Action */}
        <button 
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center text-gray-400">
             <Calendar className="w-12 h-12 mb-2 opacity-20" />
             <p>No reservations found for this selection.</p>
          </div>
        ) : (
          <div className="p-4 grid gap-3">
            {filteredBookings.map((booking: any) => (
              <div key={booking.id} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center group">
                <div className="flex items-center gap-4">
                   <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded font-bold text-sm">
                     {booking.time}
                   </div>
                   <div>
                     <div className="font-bold text-gray-900">{booking.customerName}</div>
                     <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {booking.guests} Guests • {booking.tables.map((t:any) => t.name).join(", ")}
                     </div>
                   </div>
                </div>
                
                {/* Mark as Left Button */}
                <button 
                  onClick={() => {/* Implement finish logic */}}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-50 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-200 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" /> Mark Left
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}