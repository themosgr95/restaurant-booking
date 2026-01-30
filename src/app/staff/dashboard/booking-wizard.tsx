"use client";

import { useState, useEffect } from "react";
import { X, Users, Clock, ArrowRight, ArrowLeft, Infinity as InfinityIcon, MapPin, CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";

// --- STEP 1: SMART SELECTION ---
function StepOne({ onNext, onClose, locations }: any) {
  const oneHourLater = new Date(new Date().getTime() + 60 * 60 * 1000);
  const defaultTime = oneHourLater.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [time, setTime] = useState(defaultTime);
  const [guests, setGuests] = useState(2);
  const [locationId, setLocationId] = useState("");

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayStatus = (day: number) => {
    if (day % 7 === 0) return "red"; 
    if (day === 15) return "orange"; 
    if (day >= 20 && day <= 25) return "purple"; 
    return "green";
  };

  const statusColors: any = {
    red: "bg-red-50 text-red-400 cursor-not-allowed",
    orange: "bg-orange-50 text-orange-600 border border-orange-200",
    purple: "bg-purple-50 text-purple-600 border border-purple-200",
    green: "hover:bg-gray-100 text-gray-700"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">New Reservation</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
      </div>

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
                {[1,2,3,4,5,6,7,8,9,10,12].map(n => <option key={n} value={n}>{n} People</option>)}
             </select>
           </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ${!locationId ? "opacity-50 blur-sm pointer-events-none" : "opacity-100"}`}>
         <label className="block text-xs font-bold text-gray-500 mb-1 mt-4">3. Date & Time</label>
         <div className="border rounded-xl p-4 bg-gray-50/50">
            <div className="flex justify-between mb-4 font-bold text-gray-900">
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>←</button>
              <span>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
               <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(d => {
                 const status = getDayStatus(d);
                 const isSelected = d === selectedDate.getDate();
                 return (
                   <button key={d} onClick={() => setSelectedDate(new Date(selectedDate.setDate(d)))} className={`h-9 rounded-lg text-sm font-bold ${isSelected ? "bg-black text-white" : statusColors[status]}`}>{d}</button>
                 );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
               <label className="block text-xs font-bold text-gray-500 mb-1">Time</label>
               <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded-lg p-2.5 font-bold bg-white" />
            </div>
         </div>
      </div>

      <button disabled={!locationId} onClick={() => onNext({ date: selectedDate, time, guests, locationId })} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">Check Availability <ArrowRight className="w-4 h-4" /></button>
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
       const dateStr = data.date.toISOString().split('T')[0];
       const res = await fetch(`/api/restaurant/availability?date=${dateStr}&time=${data.time}&guests=${data.guests}&locationId=${data.locationId}`);
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
             <button key={table.id} onClick={() => setSelectedTable(table)} className={`p-4 rounded-xl border-2 text-left relative ${selectedTable?.id === table.id ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-white"}`}>
               <div className="font-bold text-gray-900">{table.name}</div>
               <div className="text-xs text-gray-500 mb-4">{table.capacity} Seats</div>
               <div className="absolute bottom-4 right-4 text-xs font-bold flex items-center gap-1">
                 {table.nextBookingTime ? <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded-md">Until {table.nextBookingTime}</span> : <span className="text-green-600 bg-green-100 px-2 py-1 rounded-md"><InfinityIcon className="w-3 h-3" /> Free</span>}
               </div>
             </button>
           ))}
        </div>
      )}
      <div className="mt-auto pt-4 border-t">
        <button disabled={!selectedTable} onClick={() => onNext({ ...data, table: selectedTable })} className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-50">Continue to Details</button>
      </div>
    </div>
  );
}

// --- STEP 3: DETAILS ---
function StepThree({ data, onBack, onNext }: any) {
  const [details, setDetails] = useState({ name: "", email: "", phone: "", notes: "" });
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="text-xl font-bold">Guest Details</h2>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 mb-4 flex gap-4">
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
      <button onClick={() => onNext({ ...data, ...details })} disabled={!details.name} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Confirm Reservation</button>
    </div>
  );
}

// --- STEP 4: SUCCESS ---
function StepSuccess({ data, onClose }: any) {
  const router = useRouter();
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const saveBooking = async () => {
      const res = await fetch("/api/restaurant/create-booking-manual", {
        method: "POST",
        body: JSON.stringify({...data, date: data.date.toISOString().split('T')[0]})
      });
      if (res.ok) { setSaving(false); router.refresh(); } else { setError("Booking failed."); }
    };
    saveBooking();
  }, []);

  if (error) return <div className="text-center p-10 font-bold text-red-500">{error}</div>;
  if (saving) return <div className="text-center p-10 font-bold">Saving...</div>;

  return (
    <div className="text-center py-8">
       <CalendarCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
       <h2 className="text-2xl font-black mb-2">Confirmed!</h2>
       <button onClick={onClose} className="w-full bg-black text-white py-3 rounded-xl font-bold">Close</button>
    </div>
  );
}

// --- MAIN WIZARD COMPONENT ---
// Fix: We explicitly do NOT ask for 'open' in the props here.
export default function StaffBookingWizard({ locations, onClose }: { locations: any[], onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({});
  const goNext = (data: any) => { setBookingData({...bookingData, ...data}); setStep(step + 1); };
  const goBack = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
        {step === 1 && <StepOne onNext={goNext} onClose={onClose} locations={locations} />}
        {step === 2 && <StepTwo data={bookingData} onBack={goBack} onNext={goNext} />}
        {step === 3 && <StepThree data={bookingData} onBack={goBack} onNext={goNext} />}
        {step === 4 && <StepSuccess data={bookingData} onClose={onClose} />}
      </div>
    </div>
  );
}