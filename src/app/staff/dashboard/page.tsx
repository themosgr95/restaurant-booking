import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui-primitives";
import { 
  LayoutGrid, 
  CalendarDays, 
  Clock, 
  Armchair, 
  Settings2, 
  Store,
  ChevronRight
} from "lucide-react";
import LogoutButton from "./sign-out-btn"; 
import CreateRestaurantForm from "./create-restaurant-form";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/staff");
  }

  // Fetch restaurant data
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { restaurant: true }
  });

  const restaurant = membership?.restaurant;

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans text-slate-900">
      
      {/* 1. Modern Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 font-bold text-lg tracking-tight gap-2">
          <div className="h-6 w-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">A</div>
          Argo
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Main
          </div>
          <SidebarItem active icon={<LayoutGrid size={18} />} label="Overview" href="/staff/dashboard" />
          <SidebarItem icon={<CalendarDays size={18} />} label="Bookings" href="/staff/dashboard/bookings" />
          
          <div className="px-3 py-2 mt-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Manage
          </div>
          <SidebarItem icon={<Armchair size={18} />} label="Tables" href="/staff/dashboard/settings/tables" />
          <SidebarItem icon={<Clock size={18} />} label="Hours & Locations" href="/staff/dashboard/settings/locations" />
          <SidebarItem icon={<Settings2 size={18} />} label="Settings" href="/staff/dashboard/settings" />
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold shadow-sm text-gray-700">
              {session.user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-gray-900">{session.user.email}</p>
              <p className="text-xs text-gray-500 truncate">Admin</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 md:ml-64 p-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              {restaurant ? `Manage reservations for ${restaurant.name}` : "Let's set up your restaurant"}
            </p>
          </div>
          {restaurant && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-gray-700">Live Status: Online</span>
             </div>
          )}
        </header>

        {/* SCENARIO 1: No Restaurant (Empty State) */}
        {!restaurant && (
          <div className="max-w-xl mx-auto mt-10">
            <Card className="border-dashed border-2 shadow-none bg-gray-50">
              <CardContent className="pt-10 pb-10 text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border">
                    <Store className="w-8 h-8 text-gray-400" />
                 </div>
                 <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup Required</h2>
                 <p className="text-gray-500 mb-6">Create your restaurant profile to unlock the dashboard.</p>
                 <CreateRestaurantForm />
              </CardContent>
            </Card>
          </div>
        )}

        {/* SCENARIO 2: Dashboard Grid */}
        {restaurant && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 🟦 BLUE: Bookings (Primary Action) */}
            <DashboardCard 
              href="/staff/dashboard/bookings"
              title="Bookings"
              description="View today's reservations"
              icon={<CalendarDays className="w-6 h-6 text-blue-600" />}
              colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
              iconBg="bg-blue-100"
            />

            {/* 🟩 EMERALD: Tables (Setup) */}
            <DashboardCard 
              href="/staff/dashboard/settings/tables"
              title="Tables & Zones"
              description="Configure layout and capacity"
              icon={<Armchair className="w-6 h-6 text-emerald-600" />}
              colorClass="bg-white hover:border-emerald-300"
              iconBg="bg-emerald-50"
            />

            {/* 🟧 ORANGE: Hours (Setup) */}
            <DashboardCard 
              href="/staff/dashboard/settings/locations"
              title="Opening Hours"
              description="Set schedule and holidays"
              icon={<Clock className="w-6 h-6 text-orange-600" />}
              colorClass="bg-white hover:border-orange-300"
              iconBg="bg-orange-50"
            />

            {/* ⬜ GRAY: Settings */}
            <DashboardCard 
              href="/staff/dashboard/settings"
              title="General Settings"
              description="Restaurant details & profile"
              icon={<Settings2 className="w-6 h-6 text-gray-600" />}
              colorClass="bg-white hover:border-gray-300"
              iconBg="bg-gray-100"
            />

          </div>
        )}
      </main>
    </div>
  );
}

// --- Minimal Helper Components for cleaner code ---

function SidebarItem({ icon, label, href, active }: { icon: any, label: string, href: string, active?: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
        active 
          ? "bg-gray-900 text-white shadow-sm" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}

function DashboardCard({ href, title, description, icon, colorClass, iconBg }: any) {
  return (
    <Link href={href} className="group block h-full">
      <Card className={`h-full border transition-all duration-200 shadow-sm hover:shadow-md ${colorClass}`}>
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${iconBg}`}>
              {icon}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
          <div className="mt-auto">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:underline decoration-2 underline-offset-4 decoration-transparent group-hover:decoration-current transition-all">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}