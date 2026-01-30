import { Button, Input, Badge } from "@/components/ui-primitives";
import { Search, Plus, MoreHorizontal, Settings, LogOut } from "lucide-react";
import LogoutButton from "./logout-button"; 

// Mock Data
const bookings = [
  { id: 1, name: "Alice Johnson", time: "18:00", guests: 4, status: "confirmed", email: "alice@test.com" },
  { id: 2, name: "Bob Smith", time: "18:30", guests: 2, status: "pending", email: "bob@test.com" },
  { id: 3, name: "Charlie Davis", time: "19:00", guests: 6, status: "seated", email: "charlie@test.com" },
  { id: 4, name: "Diana Prince", time: "20:00", guests: 2, status: "cancelled", email: "diana@test.com" },
];

export default function StaffDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 font-bold text-lg">
          Argo Staff
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem active label="Bookings" />
          <NavItem label="Floor Plan" />
          <NavItem label="Availability" />
          <NavItem label="Customers" />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <NavItem label="Settings" icon={<Settings className="w-4 h-4" />} />
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 w-full max-w-md bg-slate-50 rounded-md px-3 py-1.5 border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search bookings..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-slate-400" 
            />
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Booking
          </Button>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Today's Reservations</h1>
            <span className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
              Oct 24, 2025
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Simple Filters */}
            <div className="p-1 border-b border-slate-100 bg-slate-50 flex gap-1">
               {['All', 'Upcoming', 'Seated', 'Cancelled'].map((tab, i) => (
                 <button 
                   key={tab}
                   className={`px-4 py-2 text-sm font-medium rounded-md ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 w-24">Time</th>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4 w-32">Size</th>
                    <th className="px-6 py-4 w-32">Status</th>
                    <th className="px-6 py-4 text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-900">{booking.time}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{booking.name}</div>
                        <div className="text-slate-500 text-xs">{booking.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{booking.guests} ppl</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-200 rounded-md text-slate-400 group-hover:text-slate-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Nav Item Helper
function NavItem({ label, active, icon }: { label: string, active?: boolean, icon?: React.ReactNode }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
      {icon ? icon : <div className={`w-4 h-4 rounded-sm ${active ? "bg-slate-300" : "bg-slate-200"}`} />} 
      {label}
    </button>
  );
}

// Status Badge Helper
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    seated: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.cancelled} capitalize`}>
      {status}
    </span>
  );
}