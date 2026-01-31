import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import TimelineView from "./timeline-view";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = await getServerSession(authOptions);
  
  // 1. Await Params (Next.js 15 Requirement)
  const params = await searchParams;

  if (!session) redirect("/auth/signin");

  // 2. FIX: Fetch "Location" (not Restaurant)
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user?.email! } },
    include: { location: true }
  });

  if (!membership) redirect("/setup-admin");

  // 3. Get Date
  const dateStr = params.date || new Date().toISOString().split('T')[0];
  const dateObj = new Date(dateStr);
  const nextDate = new Date(dateObj);
  nextDate.setDate(dateObj.getDate() + 1);

  // 4. Fetch Bookings for this Location
  const bookings = await prisma.booking.findMany({
    where: {
      locationId: membership.locationId,
      date: {
        gte: dateObj,
        lt: nextDate
      },
      status: { not: "CANCELLED" }
    },
    include: {
      table: true // Include table info
    },
    orderBy: { date: 'asc' }
  });

  // 5. Format Bookings for the View
  // We map the database fields to what the UI expects
  const formattedBookings = bookings.map(b => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    guests: b.guests,
    status: b.status,
    time: b.date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    tables: b.table ? [b.table] : [], // UI expects an array of tables
    notes: b.notes
  }));

  // 6. Get All Locations (if user manages multiple, though simplified to 1 for now)
  const locations = [membership.location];

  return (
    <div className="p-6">
      <TimelineView 
        locations={locations}
        bookings={formattedBookings}
        dateStr={dateStr}
      />
    </div>
  );
}