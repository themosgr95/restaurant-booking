"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Bell, Search, Filter, Users, Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import StaffBookingWizard from "./booking-wizard";
import BookingDetailsModal from "./booking-details-modal"; 
import TimelineCalendar from "./timeline-calendar"; 
import { useRouter } from "next/navigation";

export default function TimelineView({ locations, bookings, dateStr }: { locations: any[], bookings: any[], dateStr: string }) {
  const router = useRouter();
  const [activeLocationId, setActiveLocationId] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [transferBooking, setTransferBooking] = useState<any>(null);

  // Parse Date
  const [y, m, d] = dateStr.split('-').map(Number);
  const currentDate = new Date(y, m - 1, d);
  const headerDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Navigation
  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    const newStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    router.push(`?date=${newStr}`);
  };

  const goToToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    router.push(`?date=${todayStr}`);
  };

  const handleDateSelect = (newDateStr: string) => {
    router.push(`?date=${newDateStr}`);
  };

  // Filtering
  const filteredBookings = bookings.filter(b => {
    const matchesLoc = activeLocationId === "all" || b.tables.some((t: any) => t.locationId === activeLocationId);
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
        b.customerName.toLowerCase().includes(term) || 
        (b.customerEmail && b.customerEmail.toLowerCase().includes(term)) ||
        (b.customerPhone && b.customerPhone.includes(term));
    return matchesLoc && matchesSearch;
  });

  const totalGuests = filteredBookings.reduce((sum: number, b: any) => b.status !== "CANCELLED" ? sum + b.guests : sum, 0);

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

      {/* MODALS */}
      {showWizard && <StaffBookingWizard locations={locations} onClose={() => setShowWizard(false)} />}
      {transferBooking && <StaffBookingWizard locations={locations} onClose={() => setTransferBooking(null)} editBooking={transferBooking} />}
      {selectedBooking && <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onTransfer={() => { setTransferBooking(selectedBooking); setSelectedBooking(null); }} />}

      {/* HEADER */}
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

      {/* CONTROLS */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 relative">
             <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5"/></button>
             
             <div className="relative">
                <button 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                   <div>
                     <h2 className="text-lg font-bold text-gray-900 leading-none">{headerDate}</h2>
                     <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mt-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3"/> Change Date
                     </p>
                   </div>
                </button>

                {showCalendar && (
                  <TimelineCalendar 
                    currentDate={currentDate} 
                    onSelect={handleDateSelect}
                    onClose={() => setShowCalendar(false)} 
                  />
                )}
             </div>

             <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-transform"><ChevronRight className="w-5 h-5"/></button>
             
             {/* TODAY BUTTON */}
             <button onClick={goToToday} className="ml-2 flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 hover:text-black transition-colors">
                <RotateCcw className="w-3 h-3" /> Today
             </button>
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

      {/* BOOKING LIST */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center text-gray-400">
             <Bell className="w-12 h-12 mb-2 opacity-10" />
             <p className="font-medium">{searchTerm ? "No guests found matching search." : "Quiet service... no Dings! yet."}</p>
          </div>
        ) : (
          <div className="p-4 grid gap-3">
            {filteredBookings.map((booking: any) => {
              const status = booking.status || "PENDING";
              const isCancelled = status === "CANCELLED";
              const isConfirmed = status === "CONFIRMED";
              const isPending = status === "PENDING";

              let borderClass = "border-gray-100 hover:border-orange-300";
              let bgClass = "bg-white hover:bg-gray-50";
              let opacityClass = "opacity-100";
              let timeBadgeClass = "bg-gray-100 text-gray-700";

              if (isPending) {
                borderClass = "border-blue-300 ring-1 ring-blue-100 shadow-sm";
                bgClass = "bg-blue-50/50 hover:bg-blue-50";
                timeBadgeClass = "bg-blue-600 text-white"; 
              } else if (isConfirmed) {
                 borderClass = "border-green-200";
                 bgClass = "bg-green-50/30 hover:bg-green-50";
                 timeBadgeClass = "bg-green-100 text-green-700";
              } else if (isCancelled) {
                 borderClass = "border-red-100";
                 bgClass = "bg-red-50/50";
                 opacityClass = "opacity-60 grayscale";
                 timeBadgeClass = "bg-red-100 text-red-700 decoration-line-through";
              }

              return (
                <div 
                   key={booking.id} 
                   onClick={() => setSelectedBooking(booking)}
                   className={`p-4 border rounded-xl flex justify-between items-center group cursor-pointer transition-all duration-200 relative ${borderClass} ${bgClass} ${opacityClass}`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm ${timeBadgeClass}`}>
                        {booking.time}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${isCancelled ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {booking.customerName}
                          </span>
                          {isPending && <span className="animate-pulse bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">NEW</span>}
                          {isConfirmed && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {isCancelled && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Cancelled</span>}
                       </div>
                       
                       <div className="text-xs text-gray-500 flex items-center gap-1 font-medium mt-1">
                           <Users className="w-3 h-3" /> {booking.guests} • {booking.tables.map((t:any) => t.name).join(", ")}
                       </div>
                     </div>
                  </div>
                  
                  <div className="text-sm font-bold text-gray-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                      {isPending ? "Review" : "Details"}
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