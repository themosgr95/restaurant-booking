import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { MapPin, Clock, ShieldCheck, ArrowRight, User } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/auth/signin");

  // FIX: Fetch Membership with Location (instead of Restaurant)
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { 
      location: true 
    }
  });

  if (!membership) redirect("/setup-admin");

  const location = membership.location;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your workspace.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
               {location.name.substring(0, 1)}
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900">{location.name}</h2>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {membership.role} Account
               </p>
             </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {/* LOCATIONS LINK */}
          <Link href="/staff/dashboard/settings/locations" className="group flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                 <MapPin className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Locations & Tables</h3>
                 <p className="text-sm text-gray-500">Manage floor plans and capacities.</p>
               </div>
             </div>
             <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-600 transition-colors" />
          </Link>

          {/* OPENING HOURS (Placeholder link for now) */}
          <div className="group flex items-center justify-between p-6 opacity-50 cursor-not-allowed">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                 <Clock className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Opening Hours</h3>
                 <p className="text-sm text-gray-500">Set your weekly schedule.</p>
               </div>
             </div>
             <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Coming Soon</span>
          </div>

          {/* ADMIN */}
          <div className="group flex items-center justify-between p-6">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                 <ShieldCheck className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Account</h3>
                 <p className="text-sm text-gray-500">Logged in as {session.user.email}</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}