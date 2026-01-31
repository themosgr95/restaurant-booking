"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineCalendarProps {
  currentDate: Date;
  onSelect: (dateStr: string) => void;
  onClose: () => void;
}

export default function TimelineCalendar({ currentDate, onSelect, onClose }: TimelineCalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate);
  // Store: { "2026-02-04": { bookings: 5, isClosed: true } }
  const [data, setData] = useState<Record<string, { bookings: number, isClosed: boolean }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      const res = await fetch(`/api/restaurant/bookings/counts?month=${viewDate.getMonth()}&year=${viewDate.getFullYear()}`);
      if(res.ok) {
        const json = await res.json();
        setData(json);
      }
      setLoading(false);
    };
    fetchCounts();
  }, [viewDate.getMonth(), viewDate.getFullYear()]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    <div className="absolute top-12 left-0 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-50 w-72 animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4"/></button>
        <span className="font-bold text-gray-900">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4"/></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
        
        {days.map(d => {
          const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
          const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          
          const dayData = data[dateStr];
          const isClosed = dayData?.isClosed;
          const hasBookings = dayData?.bookings > 0;
          
          const isSelected = dateStr === currentDate.toISOString().split('T')[0];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <button
              key={d}
              onClick={() => { onSelect(dateStr); onClose(); }}
              className={`
                h-8 w-8 rounded-lg flex flex-col items-center justify-center relative transition-all
                ${isSelected ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}
                ${isToday && !isSelected ? 'border border-gray-200 font-bold' : ''}
                ${isClosed && !isSelected ? 'bg-red-50 text-red-300' : ''} 
              `}
            >
              <span className="text-xs leading-none">{d}</span>
              
              {/* INDICATORS */}
              {loading ? null : (
                 <div className="flex gap-0.5 mt-0.5">
                   {isClosed && <span className="h-1 w-1 rounded-full bg-red-500" />}
                   {!isClosed && hasBookings && <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`} />}
                 </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t flex justify-center text-[10px] text-gray-400 gap-3">
         <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"/> Bookings</span>
         <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Closed</span>
      </div>
      
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}