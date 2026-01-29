import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  // 1. Check if the user is actually logged in
  const session = await getServerSession(authOptions);

  // 2. If not logged in, kick them back to the login page
  if (!session) {
    redirect("/staff");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="font-bold text-xl text-gray-900">Restaurant Admin</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {session.user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder Card 1 */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Bookings
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>View and manage upcoming reservations.</p>
                </div>
              </div>
            </div>
            
             {/* Placeholder Card 2 */}
             <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Settings
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Configure restaurant details and tables.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}