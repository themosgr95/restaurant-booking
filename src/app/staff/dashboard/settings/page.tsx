import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import SettingsInterface from "./settings-interface";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/staff");
  }
  
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { 
      restaurant: {
        include: { locations: { orderBy: { createdAt: 'asc' } } }
      }
    }
  });

  // Safety check for new users
  if (!membership?.restaurant) {
     return (
       <div className="p-12 text-center">
         <h2 className="text-xl font-bold">No Restaurant Found</h2>
         <a href="/staff" className="text-blue-600 underline">Return to Dashboard</a>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER (Cleaned up - No Back Button) */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <SettingsInterface 
          restaurant={membership.restaurant} 
          locations={membership.restaurant.locations} 
        />
      </div>
    </div>
  );
}