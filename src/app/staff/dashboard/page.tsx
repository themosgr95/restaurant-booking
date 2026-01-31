import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import DashboardClient from "./dashboard-client";

// FIX: Accept searchParams as a Promise (Next.js 15 Standard)
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user?.email! } },
    include: { restaurant: true }
  });

  if (!membership) redirect("/setup-admin");

  const restaurantId = membership.restaurant.id;
  const locations = await prisma.location.findMany({
    where: { restaurantId },
    include: { tables: true } 
  });

  // 1. DETERMINE DATE
  // Await searchParams before using
  const params = await searchParams;
  const dateParam = params?.date; 
  
  let targetDate = new Date(); // Default to Today
  if (dateParam) {
    // Parse YYYY-MM-DD safely
    const [y, m, d] = dateParam.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      targetDate = new Date(y, m - 1, d);
    }
  }

  // Set to Midnight for DB Query
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // 2. FETCH BOOKINGS FOR TARGET DATE
  const bookings = await prisma.booking.findMany({
    where: {
      restaurantId,
      date: {
        gte: targetDate,
        lt: nextDay
      },
    },
    include: {
      bookingTables: {
        include: { table: true }
      }
    },
    orderBy: { time: 'asc' }
  });

  // 3. Transform
  const formattedBookings = bookings.map(b => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    date: b.date.toISOString(),
    time: b.time,
    guests: b.guests,
    notes: b.notes,
    status: b.status,
    tables: b.bookingTables.map(bt => bt.table),
  }));

  // Pass the CURRENT DATE string to the client so it knows where it is
  const currentDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

  return (
    <DashboardClient 
       locations={locations} 
       bookings={formattedBookings} 
       currentDate={currentDateStr} // <--- Passing this is key!
    />
  );
}