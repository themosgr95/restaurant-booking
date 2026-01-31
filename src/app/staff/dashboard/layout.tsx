"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calendar, Clock, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Timeline", href: "/staff/dashboard/timeline", icon: Calendar },
    { name: "Tables", href: "/staff/dashboard/tables", icon: LayoutGrid }, // <--- FIXED LINK (No longer inside /settings)
    { name: "Hours", href: "/staff/dashboard/settings/hours", icon: Clock },
    { name: "Settings", href: "/staff/dashboard/settings/restaurant", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Area */}
            <div className="flex items-center gap-4">
              <div className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl">
                A
              </div>
              <div>
                <h1 className="font-bold text-gray-900 leading-none">Argo</h1>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider">OWNER DASHBOARD</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 h-full">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative h-full flex items-center gap-2 text-sm font-bold transition-colors ${
                      isActive ? "text-black" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.name}
                    {/* Active Underline Indicator */}
                    {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-black rounded-t-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank" className="text-sm font-bold text-blue-600 hover:underline hidden sm:block">
                View Booking Page ↗
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <Link href="/api/auth/signout" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}