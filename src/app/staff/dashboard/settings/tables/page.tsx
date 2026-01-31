import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
// REMOVED THE MISSING IMPORT HERE

export default async function TablesSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/auth/signin");

  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { 
      location: {
        include: {
          tables: {
            orderBy: { name: 'asc' }
          }
        }
      } 
    }
  });

  if (!membership) redirect("/setup-admin");

  const location = membership.location;
  const tables = location.tables;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tables</h1>
          <p className="text-gray-500">Manage floor plan for {location.name}.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {tables.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">No tables added yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {tables.map(table => (
               <div key={table.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex justify-between items-center">
                  <span className="font-bold text-gray-900">{table.name}</span>
                  <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200">
                    {table.capacity} ppl
                  </span>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}