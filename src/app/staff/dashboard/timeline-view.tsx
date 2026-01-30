// ... imports
import { CheckCircle } from "lucide-react";

// Inside the booking mapping loop:
{filteredBookings.map((booking: any) => {
  // Logic: Show button only if reservation time has passed (started)
  const now = new Date();
  const bookingTime = new Date(`${today} ${booking.time}`); // Rough parse
  const hasStarted = now >= bookingTime; 
  const isCompleted = booking.notes?.includes("COMPLETED");

  return (
    <div key={booking.id} className={`p-4 border rounded-lg flex justify-between items-center group ${isCompleted ? 'bg-gray-100 opacity-50' : 'border-gray-100 hover:border-gray-300'}`}>
       
       <div className="flex items-center gap-4">
          <div className="bg-gray-100 px-3 py-1 rounded text-sm font-bold text-gray-900">
            {booking.time}
          </div>
          <div>
            <div className={`font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
               {booking.customerName}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
               <Users className="w-3 h-3" /> {booking.guests} Guests • {booking.tables.map((t:any) => t.name).join(", ")}
            </div>
          </div>
       </div>

       {/* "Mark as Left" Button */}
       {!isCompleted && (
         <button 
           onClick={async () => {
             if(!confirm("Did the customer leave? This will free the table.")) return;
             await fetch("/api/restaurant/booking/finish", {
               method: "POST",
               body: JSON.stringify({ bookingId: booking.id })
             });
             // Trigger refresh or state update here
             window.location.reload(); 
           }}
           className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded-md text-xs font-bold border border-green-200 flex items-center gap-1"
         >
           <CheckCircle className="w-3 h-3" /> Mark Finished
         </button>
       )}
       
       {isCompleted && <span className="text-xs font-bold text-gray-400">Finished</span>}
    </div>
  );
})}