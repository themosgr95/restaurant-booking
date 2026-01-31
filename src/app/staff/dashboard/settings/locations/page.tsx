import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, MapPin, ArrowRight } from "lucide-react";

export default async function LocationsSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/auth/signin");

  // FIX: Fetch all memberships for this user to see their locations
  const memberships = await prisma.membership.findMany({
    where: { user: { email: session.user.email } },
    include: { 
      location: true 
    },
    orderBy: { createdAt: 'asc' }
  });

  // Extract just the locations from the memberships
  const locations = memberships.map(m => m.location);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Locations</h1>
          <p className="text-gray-500">Manage your restaurant locations.</p>
        </div>
        
        {/* Simple "Add" button that could link to a setup page if you build one later */}
        <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-bold text-sm cursor-not-allowed" title="Multi-location support coming soon">
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      <div className="grid gap-4">
        {locations.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No locations found.</p>
          </div>
        ) : (
          locations.map((loc) => (
            <div key={loc.id} className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between hover:border-orange-500 transition-colors group shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                   <MapPin className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900">{loc.name}</h2>
                   <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                      Turnover: {loc.turnoverTime || 90} mins
                   </p>
                </div>
              </div>

              <Link 
                href={`/staff/dashboard/settings/locations/${loc.id}`}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-orange-600 transition-colors"
              >
                Edit Settings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}