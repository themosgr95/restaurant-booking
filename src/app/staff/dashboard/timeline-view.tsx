"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Users, ChevronLeft, ChevronRight, Plus, CheckCircle, Bell } from "lucide-react";
import StaffBookingWizard from "./booking-wizard";

export default function TimelineView({ locations, bookings }: { locations: any[], bookings: any[] }) {
  const [activeLocationId, setActiveLocationId] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Filter Bookings
  const filteredBookings = activeLocationId === "all"
    ? bookings
    : bookings.filter(b => b.tables.some((t: any) => t.locationId === activeLocationId));

  const totalGuests = filteredBookings.reduce((sum: number, b: any) => sum + b.guests, 0);

  // Audio Logic
  const [prevBookingCount, setPrevBookingCount] = useState(bookings.length);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (bookings.length > prevBookingCount) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked"));
      }
    }
    setPrevBookingCount(bookings.length);
  }, [bookings.length]);

  const handleMarkLeft = async (bookingId: string) => {
    if (!confirm("Did the guests leave? This will clear the table for the next Ding!")) return;
    const res = await fetch("/api/restaurant/booking/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    if (res.ok) window.location.reload(); 
  };

  return (
    <div className="space-y-6">
      {/* Hidden Ding! Sound Source */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Booking Wizard (Condition: showWizard) */}
      {showWizard && (
        <StaffBookingWizard 
          locations={locations} 
          onClose={() => setShowWizard(false)} 
        />
      )}

      {/* Header: Ding! */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
            <Bell className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900 leading-none">DING!</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Service Management</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft className="w-5 h-5"/></button>
             <div>
               <h2 className="text-lg font-bold text-gray-900 leading-none">{today}</h2>
               <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mt-1">Service Live</p>
             </div>
             <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><ChevronRight className="w-5 h-5"/></button>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <div className="text-center">
              <span className="block text-xl font-black text-gray-900 leading-none">{filteredBookings.length}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Dings</span>
            </div>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <div className="text-center">
              <span className="block text-xl font-black text-gray-900 leading-none">{totalGuests}</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Guests</span>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveLocationId("all")} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeLocationId === "all" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>All Areas</button>
          {locations.map(loc => (
            <button key={loc.id} onClick={() => setActiveLocationId(loc.id)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeLocationId === loc.id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>{loc.name}</button>
          ))}
        </div>

        <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md shadow-orange-100 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> New Ding!
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center text-gray-400">
             <Bell className="w-12 h-12 mb-2 opacity-10" />
             <p className="font-medium">Quiet service... no Dings! yet.</p>
          </div>
        ) : (
          <div className="p-4 grid gap-3">
            {filteredBookings.map((booking: any) => {
              const isFinished = booking.notes?.includes("COMPLETED");
              return (
                <div key={booking.id} className={`p-4 border rounded-lg flex justify-between items-center group transition-all ${isFinished ? 'bg-gray-50 border-transparent' : 'border-gray-100 hover:border-orange-200 hover:shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`px-3 py-1 rounded font-bold text-sm ${isFinished ? 'bg-gray-200 text-gray-400' : 'bg-orange-50 text-orange-700'}`}>{booking.time}</div>
                     <div>
                       <div className={`font-bold ${isFinished ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{booking.customerName}</div>
                       <div className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {booking.guests} Guests • {booking.tables.map((t:any) => t.name).join(", ")}</div>
                     </div>
                  </div>
                  {!isFinished ? (
                    <button onClick={() => handleMarkLeft(booking.id)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-600 px-3 py-1 rounded-md text-xs font-bold border border-gray-200 hover:bg-orange-600 hover:text-white hover:border-orange-600 flex items-center gap-1 shadow-sm">
                      <CheckCircle className="w-3 h-3" /> Clear Table
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 py-1 bg-gray-100 rounded">Service Done</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}