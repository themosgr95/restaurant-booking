"use client";

import { useState, useEffect, useRef } from "react";
// FIX: Added 'Users' to the import list below
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Bell, Search, Filter, Users } from "lucide-react";
import StaffBookingWizard from "./booking-wizard";
import BookingDetailsModal from "./booking-details-modal"; 

export default function TimelineView({ locations, bookings }: { locations: any[], bookings: any[] }) {
  const [activeLocationId, setActiveLocationId] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New State for Details & Transfer
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [transferBooking, setTransferBooking] = useState<any>(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // 1. FILTERING LOGIC (Location + Search)
  const filteredBookings = bookings.filter(b => {
    // Location Filter
    const matchesLoc = activeLocationId === "all" || b.tables.some((t: any) => t.locationId === activeLocationId);
    
    // Search Filter
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
        b.customerName.toLowerCase().includes(term) || 
        (b.customerEmail && b.customerEmail.toLowerCase().includes(term)) ||
        (b.customerPhone && b.customerPhone.includes(term));

    return matchesLoc && matchesSearch;
  });

  const totalGuests = filteredBookings.reduce((sum: number, b: any) => sum + b.guests, 0);

  // Audio Logic
  const [prevBookingCount, setPrevBookingCount] = useState(bookings.length);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (bookings.length > prevBookingCount) {
      if (audioRef.current) audioRef.current.play().catch(e => console.log("Audio blocked"));
    }
    setPrevBookingCount(bookings.length);
  }, [bookings.length]);

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* --- MODALS --- */}
      
      {/* 1. New Booking Wizard */}
      {showWizard && (
        <StaffBookingWizard 
          locations={locations} 
          onClose={() => setShowWizard(false)} 
        />
      )}

      {/* 2. Transfer Wizard (Reuses Wizard but passes editBooking) */}
      {transferBooking && (
        <StaffBookingWizard 
          locations={locations} 
          onClose={() => setTransferBooking(null)}
          editBooking={transferBooking} 
        />
      )}

      {/* 3. Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal 
           booking={selectedBooking} 
           onClose={() => setSelectedBooking(null)}
           onTransfer={() => {
             setTransferBooking(selectedBooking); // Start Transfer
             setSelectedBooking(null); // Close Details
           }}
        />
      )}


      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
            <Bell className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900 leading-none">DING!</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Service Management</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input 
              placeholder="Search guest name, phone, email..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* --- CONTROLS --- */}
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

          <div className="hidden md:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
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

        <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md shadow-orange-100 transition-all active:scale-95 whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Ding!
        </button>
      </div>

      {/* --- BOOKING LIST --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center text-gray-400">
             <Bell className="w-12 h-12 mb-2 opacity-10" />
             <p className="font-medium">{searchTerm ? "No guests found matching search." : "Quiet service... no Dings! yet."}</p>
          </div>
        ) : (
          <div className="p-4 grid gap-3">
            {filteredBookings.map((booking: any) => {
              const isFinished = booking.status === "COMPLETED"; 
              const isCancelled = booking.status === "CANCELLED";
              const isConfirmed = booking.status === "CONFIRMED";

              return (
                <div 
                   key={booking.id} 
                   onClick={() => setSelectedBooking(booking)} // CLICK TO OPEN DETAILS
                   className={`p-4 border rounded-lg flex justify-between items-center group cursor-pointer transition-all 
                     ${isCancelled ? 'bg-red-50 border-red-100 opacity-60' : 
                       isFinished ? 'bg-gray-50 border-transparent' : 
                       'border-gray-100 hover:border-orange-300 hover:shadow-md hover:bg-orange-50/10'}`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`px-3 py-1 rounded font-bold text-sm 
                        ${isCancelled ? 'bg-red-200 text-red-700' : 
                          isConfirmed ? 'bg-green-100 text-green-700' : 
                          'bg-orange-50 text-orange-700'}`}>
                        {booking.time}
                     </div>
                     <div>
                       <div className={`font-bold text-lg ${isFinished || isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                           {booking.customerName}
                       </div>
                       <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                           <Users className="w-3 h-3" /> {booking.guests} • {booking.tables.map((t:any) => t.name).join(", ")}
                           {isConfirmed && <span className="text-green-600 flex items-center gap-0.5 ml-2"><CheckCircle className="w-3 h-3"/> Confirmed</span>}
                       </div>
                     </div>
                  </div>
                  
                  {/* Quick Action */}
                  <div className="text-gray-300 group-hover:text-orange-400 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}