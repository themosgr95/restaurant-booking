import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import SettingsInterface from "./settings-interface";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session?.user?.email! } },
    include: { 
      restaurant: {
        include: { locations: { orderBy: { createdAt: 'asc' } } }
      }
    }
  });

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
          restaurant={membership?.restaurant} 
          locations={membership?.restaurant?.locations || []} 
        />
      </div>
    </div>
  );
}