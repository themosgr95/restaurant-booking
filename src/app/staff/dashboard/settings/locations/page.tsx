import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import AddLocationForm from "./add-location-form";

export default async function LocationsPage() {
  const session = await getServerSession(authOptions);
  
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session?.user?.email! } },
    include: { 
      restaurant: { 
        include: { 
          locations: {
            orderBy: { createdAt: 'asc' }
          } 
        } 
      } 
    }
  });

  const locations = membership?.restaurant?.locations || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage Locations</h1>
        </div>

        <AddLocationForm />

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setup</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                    No locations yet. Add "Main Room" above!
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loc.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-gray-500 text-xs">
                        {/* We can eventually count hours here if we want */}
                        Click Manage to see hours
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/staff/dashboard/settings/locations/${loc.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Manage Hours →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}