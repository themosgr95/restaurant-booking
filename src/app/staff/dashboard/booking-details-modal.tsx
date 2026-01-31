"use client";

import { X, Phone, Mail, Calendar, Clock, MapPin, CheckCircle, Ban, ArrowRightLeft, User, MessageSquare, AlertCircle, Pencil, Save, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingDetailsModal({ booking, onClose, onTransfer }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Toggle Edit Mode

  // Local state for editing form
  const [formData, setFormData] = useState({
    customerName: booking.customerName,
    customerPhone: booking.customerPhone || "",
    customerEmail: booking.customerEmail || "",
    notes: booking.notes || ""
  });

  // Handle Status (Confirm/Cancel)
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "CANCELLED" && !confirm("Are you sure you want to cancel this reservation?")) return;
    setLoading(true);
    try {
      await fetch(`/api/restaurant/booking/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
      onClose();
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Edits
  const handleSaveEdits = async () => {
    setLoading(true);
    try {
      await fetch(`/api/restaurant/booking/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      router.refresh();
      setIsEditing(false); // Exit edit mode
    } catch (e) {
      alert("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const dateObj = new Date(booking.date);
  const displayDate = isNaN(dateObj.getTime()) ? "Invalid Date" : dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-50 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-black text-lg text-gray-900">{isEditing ? "Edit Details" : "Reservation Details"}</h2>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ID: {booking.id.substring(0,8)}</div>
          </div>
          
          <div className="flex gap-2">
             {!isEditing && (
               <button onClick={() => setIsEditing(true)} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-gray-600 transition-colors" title="Edit Customer Info">
                  <Pencil className="w-4 h-4" />
               </button>
             )}
             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
          </div>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Customer Profile */}
          <div className="flex items-start gap-4">
             <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-2xl shrink-0">
               {formData.customerName.charAt(0)}
             </div>
             
             <div className="flex-1 min-w-0 space-y-2">
               {isEditing ? (
                 <>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Guest Name</label>
                      <input 
                        className="w-full p-2 border rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                      <input 
                        className="w-full p-2 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                      <input 
                        className="w-full p-2 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none" 
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      />
                   </div>
                 </>
               ) : (
                 <>
                   <div className="font-bold text-xl text-gray-900 truncate">{booking.customerName}</div>
                   <div className="flex flex-col gap-1 mt-1">
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                       <Phone className="w-3.5 h-3.5 text-gray-400" /> 
                       {booking.customerPhone || <span className="text-gray-400 italic">No Phone Provided</span>}
                     </div>
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                       <Mail className="w-3.5 h-3.5 text-gray-400" /> 
                       {booking.customerEmail || <span className="text-gray-400 italic">No Email Provided</span>}
                     </div>
                   </div>
                 </>
               )}
             </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Booking Data Grid (Read Only) */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</div>
                <div className="font-bold text-gray-900">{displayDate}</div>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time</div>
                <div className="font-bold text-gray-900 text-lg">{booking.time}</div>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Guests</div>
                <div className="font-bold text-gray-900 text-lg">{booking.guests} ppl</div>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Table</div>
                <div className="font-bold text-gray-900">{booking.tables.map((t:any) => t.name).join(", ")}</div>
             </div>
          </div>

          {/* Notes (Editable) */}
          {isEditing ? (
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Notes</label>
                <textarea 
                  className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none min-h-[80px] resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add special requests..."
                />
             </div>
          ) : (
             booking.notes && (
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                   <div className="flex items-center gap-2 font-bold mb-1 text-xs uppercase"><MessageSquare className="w-3 h-3"/> Special Requests</div>
                   {booking.notes}
                </div>
             )
          )}

          {/* Status Badge */}
          {!isEditing && (
            <div className="flex justify-center">
               {booking.status === "PENDING" && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Pending Confirmation</span>}
               {booking.status === "CONFIRMED" && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Confirmed</span>}
               {booking.status === "CANCELLED" && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Ban className="w-3 h-3"/> Cancelled</span>}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t flex gap-2 shrink-0">
           {isEditing ? (
             <>
               <button onClick={() => setIsEditing(false)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors font-bold">
                  <RotateCcw className="w-4 h-4" /> Cancel
               </button>
               <button onClick={handleSaveEdits} disabled={loading} className="flex-[2] flex items-center justify-center gap-2 p-3 rounded-xl text-white bg-black hover:bg-gray-800 transition-colors font-bold shadow-lg">
                  {loading ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Save className="w-4 h-4" />}
                  Save Changes
               </button>
             </>
           ) : (
             <>
               <button onClick={() => handleStatusChange("CANCELLED")} disabled={loading} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl text-red-600 hover:bg-red-100 hover:scale-105 transition-all active:scale-95">
                  <Ban className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Cancel</span>
               </button>
               
               <button onClick={onTransfer} disabled={loading} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all active:scale-95">
                  <ArrowRightLeft className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Transfer</span>
               </button>

               <button onClick={() => handleStatusChange("CONFIRMED")} disabled={loading} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl text-green-600 hover:bg-green-100 hover:scale-105 transition-all active:scale-95">
                  <CheckCircle className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Confirm</span>
               </button>
             </>
           )}
        </div>

      </div>
    </div>
  );
}