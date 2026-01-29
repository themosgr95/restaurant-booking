import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import HoursForm from "./hours-form";
import ClosuresForm from "./closures-form";

export default async function LocationDetailsPage({ params }: { params: { locationId: string } }) {
  const location = await prisma.location.findUnique({
    where: { id: params.locationId },
    include: {
      openingHours: true,
      specialClosures: {
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!location) return <div>Location not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/dashboard/settings/locations" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to Locations
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Managing: {location.name}
          </h1>
        </div>

        <HoursForm locationId={location.id} initialData={location.openingHours} />
        
        <ClosuresForm locationId={location.id} closures={location.specialClosures} />

      </div>
    </div>
  );
}