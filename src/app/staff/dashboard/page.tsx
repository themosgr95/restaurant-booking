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

  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user?.email! } },
    include: { restaurant: true }
  });

  if (!membership) {
    redirect("/setup-admin");
  }

  const restaurantId = membership.restaurant.id;

  // 1. Get Locations
  const locations = await prisma.location.findMany({
    where: { restaurantId },
    include: { tables: true } 
  });

  // 2. Get Bookings
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
    },
    include: {
      bookingTables: {
        include: { table: true }
      }
    },
    orderBy: { time: 'asc' }
  });

  // 3. Transform Data (CRITICAL: Pass all fields explicitly)
  const formattedBookings = bookings.map(b => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail, // Pass Email
    customerPhone: b.customerPhone, // Pass Phone
    date: b.date.toISOString(),     // Pass Date as String to avoid serialization errors
    time: b.time,
    guests: b.guests,
    notes: b.notes,
    status: b.status,               // Pass Status
    tables: b.bookingTables.map(bt => bt.table),
  }));

  return <DashboardClient locations={locations} bookings={formattedBookings} />;
}