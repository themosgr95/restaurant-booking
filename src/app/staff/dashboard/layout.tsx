"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LayoutGrid, Settings, Calendar, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">A</div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">Argo</h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Owner Dashboard</p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <a href="/" target="_blank" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View Booking Page ↗
              </a>
              <div className="h-4 w-px bg-gray-200"></div>
              <button 
                onClick={() => signOut({ callbackUrl: "/staff" })}
                className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* MAIN TABS */}
          <div className="flex items-center gap-1 pb-0 overflow-x-auto">
            <TabItem 
              href="/staff/dashboard" 
              icon={<Calendar className="w-4 h-4" />} 
              label="Timeline" 
              active={pathname === "/staff/dashboard" || pathname.includes("/bookings")} 
            />
            <TabItem 
              href="/staff/dashboard/settings/tables" 
              icon={<LayoutGrid className="w-4 h-4" />} 
              label="Tables" 
              active={pathname.includes("/tables")} 
            />
            <TabItem 
              href="/staff/dashboard/settings/locations" 
              icon={<Clock className="w-4 h-4" />} 
              label="Hours" 
              active={pathname.includes("/locations")} 
            />
            <TabItem 
              href="/staff/dashboard/settings" 
              icon={<Settings className="w-4 h-4" />} 
              label="Settings" 
              active={pathname === "/staff/dashboard/settings"} 
            />
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}

// Helper Component for Tabs
function TabItem({ href, icon, label, active }: any) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
        active 
          ? "border-black text-black" 
          : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
      }`}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}