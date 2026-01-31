"use client";

import { X, Phone, Mail, Calendar, Clock, MapPin, CheckCircle, Ban, ArrowRightLeft, User, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingDetailsModal({ booking, onClose, onTransfer }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if(!confirm(`Mark this booking as ${newStatus}?`)) return;
    setLoading(true);
    await fetch(`/api/restaurant/booking/${booking.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    });
    setLoading(false);
    onClose();
    router.refresh();
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-50 duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="font-black text-lg text-gray-900">Reservation Details</h2>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ID: {booking.id.substring(0,8)}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Customer */}
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl">
               {booking.customerName.charAt(0)}
             </div>
             <div>
               <div className="font-bold text-xl text-gray-900">{booking.customerName}</div>
               <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                 <Phone className="w-3 h-3" /> {booking.customerPhone || "No Phone"}
               </div>
               <div className="flex items-center gap-2 text-sm text-gray-600">
                 <Mail className="w-3 h-3" /> {booking.customerEmail || "No Email"}
               </div>
             </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Booking Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</div>
                <div className="font-bold text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time</div>
                <div className="font-bold text-gray-900">{booking.time}</div>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Guests</div>
                <div className="font-bold text-gray-900">{booking.guests} People</div>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Table</div>
                <div className="font-bold text-gray-900 text-sm">{booking.tables.map((t:any) => t.name).join(", ")}</div>
             </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm text-yellow-800">
               <div className="flex items-center gap-2 font-bold mb-1 text-xs uppercase"><MessageSquare className="w-3 h-3"/> Special Requests</div>
               {booking.notes}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t flex gap-2">
           <button onClick={() => handleStatusChange("CANCELLED")} disabled={loading} className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors">
              <Ban className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">Cancel</span>
           </button>
           
           <button onClick={onTransfer} disabled={loading} className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
              <ArrowRightLeft className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">Transfer</span>
           </button>

           <button onClick={() => handleStatusChange("CONFIRMED")} disabled={loading} className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg text-green-600 hover:bg-green-100 transition-colors">
              <CheckCircle className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">Confirm</span>
           </button>
        </div>

      </div>
    </div>
  );
}