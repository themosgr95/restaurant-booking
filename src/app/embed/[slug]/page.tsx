import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import BookingClient from "../../book/[slug]/booking-client"; // Reusing your existing client!

export default async function EmbedPage({ params }: { params: { slug: string } }) {
  // 1. Fetch Restaurant by Slug
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
    include: { 
      locations: { 
        orderBy: { turnoverTime: 'desc' } 
      } 
    }
  });

  if (!restaurant) notFound();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2">
      {/* We wrap the client in a container that fits well in an iframe.
         The 'bg-white' ensures it pops out against the host site's background.
      */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Minimal Header for the Widget */}
        <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
          <h1 className="font-bold text-lg truncate">{restaurant.name}</h1>
          <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
            Ding!
          </div>
        </div>

        <div className="p-4">
           {/* Reuse the logic, but maybe we hide the 'Step 1' heavy text in the client via CSS or props later if needed */}
           <BookingClient 
              restaurantId={restaurant.id} 
              locations={restaurant.locations} 
           />
        </div>

        {/* Footer Credit */}
        <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
           <a href="https://your-app-url.com" target="_blank" className="text-[10px] text-gray-400 font-medium hover:text-orange-500 transition-colors flex items-center justify-center gap-1">
             <span>Powered by</span> 
             <span className="font-black italic">Ding!</span>
           </a>
        </div>
      </div>
    </div>
  );
}