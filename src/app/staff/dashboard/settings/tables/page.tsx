import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import TablesManager from "./tables-manager";

export default async function TablesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/staff");

  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { 
      restaurant: { 
        include: { 
          locations: {
            orderBy: { createdAt: 'asc' },
            include: {
              tables: { orderBy: { createdAt: 'asc' } }
            }
          } 
        } 
      } 
    }
  });

  const locations = membership?.restaurant?.locations || [];

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER (Clean - No Back Button) */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Tables</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your floor plan and seating capacity.</p>
        </div>

        <TablesManager locations={locations} />

      </div>
    </div>
  );
}