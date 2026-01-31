import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

// 1. Define Props correctly for Next.js 15 (Params are now Promises)
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicBookingPage(props: Props) {
  // 2. Await the params
  const { slug } = await props.params;

  // 3. FIX: Fetch "Location" instead of "Restaurant"
  const location = await prisma.location.findUnique({
    where: { slug },
    include: {
      openingHours: true, // Useful info to display
    }
  });

  if (!location) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-black text-white p-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight">{location.name}</h1>
          {location.description && (
            <p className="opacity-80 mt-2 font-medium">{location.description}</p>
          )}
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Make a Reservation</h2>
            <p className="text-gray-500">
              This is the booking page for <strong>{location.name}</strong>.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center">
            <p className="text-orange-800 font-bold text-sm">
              🚀 Ready to Book
            </p>
            <p className="text-orange-600 text-xs mt-1">
              (You can import your Booking Form component here)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}