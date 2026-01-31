import { prisma } from "@/lib/db/prisma";

// 1. Define Props (Params are Promises in Next.js 15)
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EmbedPage(props: Props) {
  // 2. Await the params
  const { slug } = await props.params;

  // 3. Fetch "Location" instead of "Restaurant"
  const location = await prisma.location.findUnique({
    where: { slug },
    include: {
      openingHours: true
    }
  });

  if (!location) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 font-bold">Location not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-black text-gray-900">{location.name}</h1>
        {location.description && (
          <p className="text-sm text-gray-500 mt-1">{location.description}</p>
        )}
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 text-center">
        <p className="font-bold text-orange-800 mb-1">📅 Booking Widget</p>
        <p className="text-xs text-orange-600">
          (This simplified view is ready for embedding on other websites)
        </p>
      </div>
    </div>
  );
}