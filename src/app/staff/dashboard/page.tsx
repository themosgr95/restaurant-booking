import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Button, Card, CardContent } from "@/components/ui-primitives";
import { LayoutDashboard, Settings, Calendar, Users, Store } from "lucide-react";
// 👇 CHECK THIS IMPORT: Make sure it matches your actual filename (sign-out-btn vs logout-button)
import LogoutButton from "./sign-out-btn"; 
import CreateRestaurantForm from "./create-restaurant-form";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/staff");
  }

  // Fetch real data
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { restaurant: true }
  });

  const restaurant = membership?.restaurant;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 font-bold text-lg gap-2">
          <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center text-xs">A</div>
          Argo
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          <Link href="/staff/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-3 bg-slate-100 text-slate-900 font-medium">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Button>
          </Link>
          <Link href="/staff/dashboard/bookings">
             <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
              <Calendar className="w-4 h-4" />
              Bookings
            </Button>
          </Link>
          
          <div className="px-3 py-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Configuration
          </div>
          <Link href="/staff/dashboard/settings">
             <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
              {session.user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.email}</p>
              <p className="text-xs text-slate-500 truncate">Owner</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500">
              {restaurant ? `Managing ${restaurant.name}` : "Welcome back"}
            </p>
          </div>
          {restaurant && (
             <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 border border-emerald-200">
                ● Live
             </span>
          )}
        </header>

        {/* SCENARIO 1: No Restaurant (Show Create Form) */}
        {!restaurant && (
          <div className="max-w-xl mx-auto mt-10">
            <Card>
              <CardContent className="pt-6">
                 <div className="mb-6 text-center">
                    <Store className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900">Setup your Restaurant</h2>
                    <p className="text-slate-500">Create your entity to begin accepting reservations.</p>
                 </div>
                 <CreateRestaurantForm />
              </CardContent>
            </Card>
          </div>
        )}

        {/* SCENARIO 2: Has Restaurant (Show Cards) */}
        {restaurant && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Bookings Card */}
            <Link href="/staff/dashboard/bookings" className="block group">
              <Card className="h-full transition-all group-hover:shadow-md hover:border-slate-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">0</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">Bookings</h3>
                  <p className="text-sm text-slate-500 mt-1">View upcoming reservations</p>
                </CardContent>
              </Card>
            </Link>

            {/* Settings Card */}
            <Link href="/staff/dashboard/settings" className="block group">
               <Card className="h-full transition-all group-hover:shadow-md hover:border-slate-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <Settings className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900">Settings</h3>
                  <p className="text-sm text-slate-500 mt-1">Configure tables & hours</p>
                </CardContent>
              </Card>
            </Link>

          </div>
        )}
      </main>
    </div>
  );
}