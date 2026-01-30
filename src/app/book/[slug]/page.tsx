import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import BookingClient from "./booking-client";

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
    include: {
      locations: {
        orderBy: { turnoverTime: "desc" },
      },
    },
  });

  if (!restaurant) notFound();

  // IMPORTANT: only pass serializable fields to the Client Component
  const locations = restaurant.locations.map((l) => ({
    id: l.id,
    name: l.name,
    turnoverTime: l.turnoverTime,
  }));

  return (
    <div className="min-h-screen bg-orange-50/30 flex flex-col items-center py-12 px-4">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
          <span className="font-black italic text-sm">D!</span>
        </div>
        <h1 className="text-xl font-black tracking-tighter uppercase italic text-gray-900">Ding!</h1>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-orange-100 overflow-hidden border border-orange-100">
        <div className="bg-orange-500 p-8 text-white text-center">
          <h2 className="text-2xl font-black">{restaurant.name}</h2>
          <p className="text-orange-100 opacity-80 text-sm mt-1 uppercase tracking-widest font-bold">Reserve your table</p>
        </div>

        <div className="p-8">
          <BookingClient restaurantId={restaurant.id} locations={locations} />
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-xs font-medium">Powered by Ding! Service Management</p>
    </div>
  );
}
