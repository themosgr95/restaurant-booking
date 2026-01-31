"use client";

import { useState, useEffect } from "react";
import { X, Users, Clock, ArrowRight, ArrowLeft, Infinity as InfinityIcon, MapPin, CalendarCheck, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// HELPER: Format Date as YYYY-MM-DD (Local)
function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- STEP 1: SMART CALENDAR ---
function StepOne({ onNext, onClose, locations }: any) {
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateStatuses, setDateStatuses] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [locationId, setLocationId] = useState("");
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 1. Fetch Dates
  useEffect(() => {
    if (!locationId) return;
    const fetchDates = async () => {
      setLoadingDates(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const res = await fetch(`/api/restaurant/availability/dates?locationId=${locationId}&guests=${guests}&year=${year}&month=${month}`);
      const data = await res.json();
      setDateStatuses(data.dates || {});
      setLoadingDates(false);
    };
    fetchDates();
  }, [locationId, guests, currentMonth]);

  // 2. Fetch Slots
  useEffect(() => {
    if (!selectedDate || !locationId) {
        setAvailableSlots([]);
        return;
    }
    const fetchSlots = async () => {
       setLoadingSlots(true);
       const dateStr = getLocalDateString(selectedDate);
       const res = await fetch(`/api/restaurant/availability/slots?date=${dateStr}&locationId=${locationId}&guests=${guests}`);
       const slots = await res.json();
       setAvailableSlots(slots);
       setLoadingSlots(false);
    };
    fetchSlots();
  }, [selectedDate, locationId, guests]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full">
      {/* HEADER (Fixed) */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-xl font-bold">New Reservation</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">1. Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select 
                  value={locationId} 
                  onChange={(e) => setLocationId(e.target.value)} 
                  className="w-full pl-10 border-2 border-blue-100 bg-blue-50/50 rounded-xl p-3 text-sm font-bold text-gray-900 focus:border-blue-500"
                >
                   <option value="">-- Choose Area --</option>
                   {locations.map((loc: any) => (
                     <option key={loc.id} value={loc.id}>{loc.name} ({loc.turnoverTime || 90}m)</option>
                   ))}
                </select>
              </div>
            </div>
            <div className="col-span-2">
               <label className="block text-xs font-bold text-gray-500 mb-1">2. Party Size</label>
               <div className="relative">
                 <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                 <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full pl-10 border rounded-lg p-3 text-sm font-bold bg-white">
                    {[1,2,3,4,5,6,7,8,9,10,12,15,20].map(n => <option key={n} value={n}>{n} People</option>)}
                 </select>
               </div>
            </div>
          </div>

          {/* Calendar */}
          <div className={`transition-all duration-300 ${!locationId ? "opacity-50 blur-sm pointer-events-none" : "opacity-100"}`}>
             <label className="block text-xs font-bold text-gray-500 mb-1 mt-4">3. Select Date</label>
             <div className="border rounded-xl p-4 bg-gray-50/50">
                <div className="flex justify-between mb-4 font-bold text-gray-900">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>←</button>
                  <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>→</button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
                   <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                  
                  {days.map(d => {
                     const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
                     const dateStr = getLocalDateString(dateObj);
                     const status = dateStatuses[dateStr]; 
                     const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === currentMonth.getMonth();
                     const isPast = dateObj < todayNormalized;

                     let bgClass = "bg-transparent text-gray-400";
                     let isDisabled = false;

                     if (isPast) {
                       bgClass = "text-gray-200 cursor-not-allowed";
                       isDisabled = true;
                     } else if (status === "red") {
                       bgClass = "bg-red-50 text-red-300 font-normal";
                       isDisabled = true;
                     } else if (status === "orange") {
                       bgClass = "bg-orange-100 text-orange-600 border border-orange-200";
                       isDisabled = true; 
                     } else if (status === "purple") {
                       bgClass = "bg-purple-100 text-purple-700 border border-purple-200 font-bold";
                     } else if (status === "green") {
                       bgClass = "bg-green-100 text-green-700 font-bold hover:bg-green-200";
                     }

                     if (isSelected) bgClass = "bg-black text-white shadow-lg scale-110 z-10 border-none";

                     return (
                       <button
                         key={d}
                         disabled={isDisabled}
                         onClick={() => { setSelectedDate(dateObj); setTime(""); }}
                         className={`h-9 rounded-lg text-sm transition-all relative ${bgClass} ${isDisabled ? "cursor-not-allowed opacity-60" : "hover:scale-105"}`}
                       >
                         {d}
                       </button>
                     );
                  })}
                </div>
                
                <div className="flex gap-3 justify-center mt-4 text-[10px] font-bold text-gray-500">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Available</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Limited</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Full</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-200"></div> Closed</span>
                </div>
             </div>

             {/* Time Slots */}
             {selectedDate && (
                 <div className="mt-4 animate-in slide-in-from-top-2 duration-300 pb-4">
                    <label className="block text-xs font-bold text-gray-500 mb-2">4. Available Times</label>
                    {loadingSlots ? (
                        <div className="text-xs text-gray-400 animate-pulse">Finding open tables...</div>
                    ) : (
                        <div className="grid grid-cols-4 gap-2">
                            {availableSlots.length === 0 && <div className="col-span-4 text-center p-3 text-xs text-orange-500 bg-orange-50 rounded-lg font-bold">No tables available for {guests} people on this day.</div>}
                            {availableSlots.map(t => (
                                <button 
                                    key={t} 
                                    onClick={() => setTime(t)}
                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                        time === t ? "bg-orange-500 text-white border-orange-500 shadow-md" : "bg-white border-gray-200 hover:border-orange-300 text-gray-700"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
             )}
          </div>
      </div>

      {/* FOOTER (Fixed) */}
      <div className="pt-4 mt-auto border-t bg-white shrink-0">
          <button 
            disabled={!locationId || !selectedDate || !time} 
            onClick={() => onNext({ date: selectedDate, time, guests, locationId })} 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Table <ArrowRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
}

// --- STEP 2: SELECT TABLE ---
function StepTwo({ data, onBack, onNext }: any) {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  useEffect(() => {
    const fetchTables = async () => {
       const dateStr = getLocalDateString(data.date);
       const res = await fetch(`/api/restaurant/availability?date=${dateStr}&time=${data.time}&guests=${data.guests}&locationId=${data.locationId}`);
       const json = await res.json();
       setTables(json); 
       setLoading(false);
    };
    fetchTables();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold">Confirm Table</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-400">Finding tables...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tables.length === 0 && <div className="col-span-2 text-center text-gray-500 py-10">No tables available.</div>}
            {tables.map(table => (
              <button key={table.id} onClick={() => setSelectedTable(table)} className={`p-4 rounded-xl border-2 text-left relative ${selectedTable?.id === table.id ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-white"}`}>
                <div className="font-bold text-gray-900">{table.name}</div>
                <div className="text-xs text-gray-500 mb-4">{table.capacity} Seats</div>
                <div className="absolute bottom-4 right-4 text-xs font-bold flex items-center gap-1">
                  {table.nextBookingTime ? (
                    <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Until {table.nextBookingTime}
                    </span>
                  ) : (
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded-md flex items-center gap-1">
                      <InfinityIcon className="w-3 h-3" /> Free
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto border-t shrink-0">
        <button disabled={!selectedTable} onClick={() => onNext({ ...data, table: selectedTable })} className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-50">Continue to Details</button>
      </div>
    </div>
  );
}

// --- STEP 3: DETAILS ---
function StepThree({ data, onBack, onNext }: any) {
  const [details, setDetails] = useState({ name: "", email: "", phone: "", notes: "" });
  return (
    <div className="flex flex-col h-full">
       <div className="flex items-center gap-2 mb-4 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold">Guest Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 flex gap-4">
           <div><span className="block font-bold text-gray-400 text-xs uppercase">Date</span><span className="font-bold text-gray-900">{data.date.toLocaleDateString()}</span></div>
           <div><span className="block font-bold text-gray-400 text-xs uppercase">Time</span><span className="font-bold text-gray-900">{data.time}</span></div>
           <div><span className="block font-bold text-gray-400 text-xs uppercase">Table</span><span className="font-bold text-gray-900">{data.table.name}</span></div>
        </div>
        <div className="space-y-4">
          <input placeholder="Full Name" className="w-full border p-3 rounded-lg" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
          <input placeholder="Phone" className="w-full border p-3 rounded-lg" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} />
          <input placeholder="Email (Opt)" className="w-full border p-3 rounded-lg" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} />
          <textarea placeholder="Notes" className="w-full border p-3 rounded-lg h-20 resize-none" value={details.notes} onChange={e => setDetails({...details, notes: e.target.value})} />
        </div>
      </div>

      <div className="pt-4 mt-auto border-t shrink-0">
        <button onClick={() => onNext({ ...data, ...details })} disabled={!details.name} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Confirm Reservation</button>
      </div>
    </div>
  );
}

// --- STEP 4: SUCCESS ---
function StepSuccess({ data, onClose, isEditMode, editId }: any) {
  const router = useRouter();
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const saveBooking = async () => {
      const dateStr = getLocalDateString(data.date);
      let url = "/api/restaurant/create-booking-manual";
      let method = "POST";
      let body: any = { ...data, date: dateStr };

      if (isEditMode && editId) {
        url = `/api/restaurant/booking/${editId}`;
        method = "PATCH";
        body = { transfer: true, date: dateStr, time: data.time, tableId: data.table.id };
      }

      const res = await fetch(url, { method: method, body: JSON.stringify(body) });
      if (res.ok) { setSaving(false); router.refresh(); } else { setError("Operation failed."); }
    };
    saveBooking();
  }, []);

  if (error) return <div className="text-center p-10 font-bold text-red-500">{error}</div>;
  if (saving) return <div className="text-center p-10 font-bold">{isEditMode ? "Transferring..." : "Saving..."}</div>;

  return (
    <div className="text-center py-8">
       <CalendarCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
       <h2 className="text-2xl font-black mb-2">{isEditMode ? "Transferred!" : "Confirmed!"}</h2>
       <button onClick={onClose} className="w-full bg-black text-white py-3 rounded-xl font-bold">Close</button>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function StaffBookingWizard({ locations, onClose, editBooking }: { locations: any[], onClose: () => void, editBooking?: any }) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>(editBooking ? { guests: editBooking.guests } : {});
  const goNext = (data: any) => { setBookingData({...bookingData, ...data}); setStep(step + 1); };
  const goBack = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* ADDED: h-[90vh] and flex-col to fix height issues */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 h-[90vh] flex flex-col">
        
        {editBooking && step === 1 && (
            <div className="mb-4 bg-blue-50 text-blue-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2 shrink-0">
                <ArrowRightLeft className="w-4 h-4" />
                Transferring: {editBooking.customerName}
            </div>
        )}

        {/* Each step now takes full height and manages its own scrolling */}
        {step === 1 && <StepOne onNext={goNext} onClose={onClose} locations={locations} />}
        {step === 2 && <StepTwo data={bookingData} onBack={goBack} onNext={goNext} />}
        {step === 3 && <StepThree data={bookingData} onBack={goBack} onNext={goNext} />}
        {step === 4 && <StepSuccess data={bookingData} onClose={onClose} isEditMode={!!editBooking} editId={editBooking?.id} />}
      </div>
    </div>
  );
}