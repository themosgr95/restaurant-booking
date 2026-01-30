"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Users, Clock, ArrowRight, ArrowLeft, Check, Infinity as InfinityIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// --- STEP 1: CALENDAR & DATE ---
function StepOne({ onNext, onClose }: any) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(2);

  // Simple calendar generator
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Mock "Status" Colors (In a real app, you'd fetch this from an API)
  const getDayStatus = (day: number) => {
    if (day % 7 === 0) return "red"; // Closed on Sundays (Example)
    if (day === 15) return "orange"; // Fully booked mid-month
    if (day === 20) return "purple"; // Limited
    return "green";
  };

  const statusColors: any = {
    red: "bg-red-50 text-red-400 cursor-not-allowed",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    green: "hover:bg-gray-100 text-gray-700"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Select Date & Time</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-xl p-4">
        <div className="flex justify-between mb-4 font-bold text-gray-900">
          <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>←</button>
          <span>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
           <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(d => {
             const status = getDayStatus(d);
             const isSelected = d === selectedDate.getDate();
             return (
               <button
                 key={d}
                 onClick={() => setSelectedDate(new Date(selectedDate.setDate(d)))}
                 className={`h-10 rounded-lg text-sm font-bold transition-all ${
                    isSelected ? "bg-black text-white shadow-md scale-105" : statusColors[status]
                 }`}
               >
                 {d}
               </button>
             );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500 justify-center">
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> Closed</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Full</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Limited</span>
        </div>
      </div>

      {/* Time & Guests */}
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-xs font-bold text-gray-500 mb-1">Time</label>
           <div className="relative">
             <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
             <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full pl-10 border rounded-lg p-2.5 text-sm font-bold" />
           </div>
        </div>
        <div>
           <label className="block text-xs font-bold text-gray-500 mb-1">Guests</label>
           <div className="relative">
             <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
             <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full pl-10 border rounded-lg p-2.5 text-sm font-bold bg-white">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} people</option>)}
             </select>
           </div>
        </div>
      </div>

      <button onClick={() => onNext({ date: selectedDate, time, guests })} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
        Check Availability <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- STEP 2: SELECT TABLE ---
function StepTwo({ data, onBack, onNext }: any) {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  useEffect(() => {
    // Fetch real availability from our API
    const fetchTables = async () => {
       const dateStr = data.date.toISOString().split('T')[0];
       const res = await fetch(`/api/restaurant/availability?date=${dateStr}&time=${data.time}&guests=${data.guests}`);
       const json = await res.json();
       setTables(json);
       setLoading(false);
    };
    fetchTables();
  }, []);

  return (
    <div className="space-y-6 h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold">Select Table</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">Finding tables...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-1">
           {tables.length === 0 && <div className="col-span-2 text-center text-gray-500 py-10">No tables available.</div>}
           {tables.map(table => (
             <button
               key={table.id}
               onClick={() => setSelectedTable(table)}
               className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                 selectedTable?.id === table.id 
                   ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" 
                   : "border-gray-100 bg-white hover:border-gray-300"
               }`}
             >
               <div className="font-bold text-gray-900">{table.name}</div>
               <div className="text-xs text-gray-500 mb-4">{table.capacity} Seats</div>
               
               {/* Availability Indicator */}
               <div className="absolute bottom-4 right-4 text-xs font-bold flex items-center gap-1">
                 {table.nextBookingTime ? (
                   <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded-md">Until {table.nextBookingTime}</span>
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

      <div className="mt-auto pt-4 border-t">
        <button 
           disabled={!selectedTable}
           onClick={() => onNext({ ...data, table: selectedTable })}
           className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Details
        </button>
      </div>
    </div>
  );
}

// --- STEP 3: GUEST DETAILS & SAVE ---
function StepThree({ data, onBack, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ name: "", email: "", phone: "", notes: "" });
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    // 1. Create the Booking
    const res = await fetch("/api/restaurant/create-booking-manual", { // We will create a simple endpoint for this or reuse logic
      method: "POST",
      body: JSON.stringify({
        ...data,
        ...details,
        date: data.date.toISOString().split('T')[0]
      })
    });

    if (res.ok) {
       onClose();
       router.refresh();
    } else {
       alert("Failed to book. Table might have been taken.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
        <div>
          <h2 className="text-xl font-bold">Guest Details</h2>
          <p className="text-xs text-gray-500">
             Booking {data.table.name} • {data.date.toLocaleDateString()} at {data.time}
             {/* "Locked" Visual Cue */}
             <span className="ml-2 inline-flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">
               <Check className="w-3 h-3 mr-1" /> Table Locked
             </span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <input 
           placeholder="Guest Full Name" 
           className="w-full border p-3 rounded-lg font-medium"
           value={details.name} onChange={e => setDetails({...details, name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <input 
             placeholder="Phone Number" 
             className="w-full border p-3 rounded-lg font-medium"
             value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})}
          />
          <input 
             placeholder="Email (Optional)" 
             className="w-full border p-3 rounded-lg font-medium"
             value={details.email} onChange={e => setDetails({...details, email: e.target.value})}
          />
        </div>
        <textarea 
           placeholder="Special Notes (Allergies, Birthday, etc.)" 
           className="w-full border p-3 rounded-lg font-medium h-24 resize-none"
           value={details.notes} onChange={e => setDetails({...details, notes: e.target.value})}
        />
      </div>

      <button onClick={handleSave} disabled={loading || !details.name} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200">
        {loading ? "Confirming..." : "Confirm Reservation"}
      </button>
    </div>
  );
}

// --- MAIN WIZARD CONTAINER ---
export default function StaffBookingWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({});

  const goNext = (data: any) => {
    setBookingData({ ...bookingData, ...data });
    setStep(step + 1);
  };

  const goBack = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100 flex">
          <div className={`h-full bg-blue-600 transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
        </div>
        
        <div className="p-6">
          {step === 1 && <StepOne onNext={goNext} onClose={onClose} />}
          {step === 2 && <StepTwo data={bookingData} onBack={goBack} onNext={goNext} />}
          {step === 3 && <StepThree data={bookingData} onBack={goBack} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}