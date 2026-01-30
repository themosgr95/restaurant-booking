import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch membership to find the restaurant
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user?.email! } },
    include: { restaurant: true }
  });

  if (!membership) {
    redirect("/setup-admin");
  }

  const restaurantId = membership.restaurant.id;

  // 1. Get Locations (Needed for both Timeline & Settings)
  const locations = await prisma.location.findMany({
    where: { restaurantId },
    include: { tables: true } 
  });

  // 2. Get Today's Bookings (For Timeline)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      restaurantId,
      date: {
        gte: today,
        lt: tomorrow
      },
      // REMOVED: status: { not: "CANCELLED" } -> Fixes the build error
    },
    include: {
      bookingTables: {
        include: { table: true }
      }
    },
    orderBy: { time: 'asc' }
  });

  // Transform bookings for the UI
  const formattedBookings = bookings.map(b => ({
    id: b.id,
    customerName: b.customerName,
    time: b.time,
    guests: b.guests,
    notes: b.notes,
    tables: b.bookingTables.map(bt => bt.table),
  }));

  // Pass everything to the Client Component
  return <DashboardClient locations={locations} bookings={formattedBookings} />;
}