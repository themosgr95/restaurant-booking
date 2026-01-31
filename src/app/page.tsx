import Link from "next/link";
import { ArrowRight, UtensilsCrossed, CalendarCheck, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* Navigation */}
      <nav className="border-b border-gray-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl text-white flex items-center justify-center font-black italic text-xl">D!</div>
            <span className="font-black text-xl tracking-tighter">Ding!</span>
          </div>
          <div className="flex gap-4">
             {/* THIS IS THE CRITICAL BUTTON THAT WAS CAUSING ISSUES */}
             <Link 
               href="/auth/signin" 
               className="bg-black text-white px-6 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
             >
               Staff Login <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto mt-10 md:mt-0">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest mb-6">
          <UtensilsCrossed className="w-4 h-4" /> Restaurant Management System
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
          Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Restaurant</span> flow.
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          The all-in-one platform for table reservations, floor management, and staff scheduling. Simple, fast, and built for modern hospitality.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl text-left">
           <div className="p-6 border rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
              <CalendarCheck className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Smart Booking</h3>
              <p className="text-sm text-gray-500">Accept reservations 24/7 with our intelligent wizard that prevents double-bookings.</p>
           </div>
           <div className="p-6 border rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
              <UtensilsCrossed className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Table Management</h3>
              <p className="text-sm text-gray-500">Visual floor plan editor to manage sections, capacities, and turn-over times.</p>
           </div>
           <div className="p-6 border rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
              <Clock className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Real-time Sync</h3>
              <p className="text-sm text-gray-500">Live updates across all devices. Keep your kitchen and front-of-house in perfect sync.</p>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm font-medium border-t border-gray-100 mt-12">
        &copy; {new Date().getFullYear()} Ding! Restaurant Systems.
      </footer>
    </div>
  );
}