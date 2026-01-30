import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import AddLocationForm from "./locations/add-location-form"; // Import the existing form

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session?.user?.email! } },
    include: { 
      restaurant: {
        include: { locations: true }
      }
    }
  });

  const restaurant = membership?.restaurant;
  const locations = restaurant?.locations || [];

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-3xl">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        </div>

        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Profile</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  disabled 
                  value={restaurant?.name} 
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 shadow-sm sm:text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
                <input 
                  type="text" 
                  disabled 
                  value={restaurant?.slug} 
                  className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 shadow-sm sm:text-sm p-2"
                />
              </div>
            </div>
          </div>

          {/* Locations Management Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Locations</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add distinct physical locations (e.g. "Downtown", "West End"). 
              Manage their hours in the Dashboard.
            </p>

            {/* List of existing locations */}
            <div className="mb-8 space-y-2">
              {locations.map(loc => (
                <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="font-medium text-gray-900">{loc.name}</span>
                  <span className="text-xs text-gray-500">ID: {loc.id}</span>
                </div>
              ))}
            </div>

            {/* The Add Form */}
            <div className="pt-6 border-t border-gray-100">
               <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Location</h3>
               <AddLocationForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}