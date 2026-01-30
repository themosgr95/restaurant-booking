import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import LocationManager from "./location-manager";

export default async function LocationsPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch ALL locations with their hours/closures included
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session?.user?.email! } },
    include: { 
      restaurant: { 
        include: { 
          locations: {
            orderBy: { createdAt: 'asc' },
            include: {
              openingHours: true,
              specialClosures: {
                orderBy: { date: 'asc' }
              }
            }
          } 
        } 
      } 
    }
  });

  const locations = membership?.restaurant?.locations || [];

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/staff/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Opening Hours & Special Days</h1>
          </div>
          
          <Link href="/staff/dashboard/settings">
             <button className="text-sm text-indigo-600 font-medium hover:underline">
               + Add new location in Settings
             </button>
          </Link>
        </div>

        {/* The New Tabbed Interface */}
        <LocationManager locations={locations} />

      </div>
    </div>
  );
}