import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
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

  // --- SAFETY CHECK START ---
  // If the user exists but has no restaurant (common after DB reset), show this warning.
  if (!membership?.restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Restaurant Found</h2>
          <p className="text-gray-500 mb-6">
            Your user account doesn't seem to be linked to a restaurant. 
            This usually happens after a database reset.
          </p>
          <a 
            href="/api/setup-admin" 
            className="inline-block bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-neutral-800"
          >
            Run Setup Script Again
          </a>
        </div>
      </div>
    );
  }
  // --- SAFETY CHECK END ---

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Dashboard
          </Link>
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