import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import LogoutButton from "./logout-button";
import CreateRestaurantForm from "./create-restaurant-form";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/staff");
  }

  // Check if user has any restaurant membership
  const membership = await prisma.membership.findFirst({
    where: {
      user: {
        email: session.user.email
      }
    },
    include: {
      restaurant: true
    }
  });

  const restaurant = membership?.restaurant;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="font-bold text-xl text-gray-900">
                {restaurant ? restaurant.name : "Welcome"}
              </div>
              {restaurant && (
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {restaurant.slug}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {session.user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          {/* SCENARIO 1: No Restaurant yet */}
          {!restaurant && (
            <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Get Started</h2>
                <p className="text-gray-500">Create your first restaurant to begin accepting bookings.</p>
              </div>
              <CreateRestaurantForm />
            </div>
          )}

          {/* SCENARIO 2: Has Restaurant (The Dashboard) */}
          {restaurant && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Overview</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      📅 Bookings
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      0 upcoming reservations
                    </p>
                  </div>
                </div>
                
                 <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      ⚙️ Settings
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Configure tables and hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}