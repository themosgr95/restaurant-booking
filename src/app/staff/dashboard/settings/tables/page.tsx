import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import AddTableForm from "./add-table-form";
import TableListItem from "./table-list-item"; // <--- Import the new component

export default async function TablesPage() {
  const session = await getServerSession(authOptions);
  
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session?.user?.email! } },
    include: { 
      restaurant: { 
        include: { 
          tables: {
            orderBy: { createdAt: 'asc' }
          } 
        } 
      } 
    }
  });

  const tables = membership?.restaurant?.tables || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/staff/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tables</h1>
        </div>

        <AddTableForm />

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tables.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                    No tables yet. Add one above!
                  </td>
                </tr>
              ) : (
                tables.map((table) => (
                  <TableListItem key={table.id} table={table} />
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}