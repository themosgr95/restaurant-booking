import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  const time = searchParams.get("time"); // HH:mm
  const guests = parseInt(searchParams.get("guests") || "2");

  if (!date || !time) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Get the Restaurant
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { restaurant: true }
  });
  if (!membership) return NextResponse.json({ error: "No restaurant" }, { status: 400 });

  // 2. Define the Booking Slot (Assume 90 min duration for simplicity)
  const bookingStart = new Date(`${date}T${time}:00`);
  const bookingEnd = new Date(bookingStart.getTime() + 90 * 60000);

  // 3. Find ALL tables that match capacity
  // We explicitly include 'bookings' to check for collisions
  const tables = await prisma.table.findMany({
    where: {
      location: { restaurantId: membership.restaurantId },
      capacity: { gte: guests }
    },
    include: {
      bookings: {
        where: {
          booking: {
            date: { equals: new Date(date) } // Only fetch bookings for THIS day to save performance
          }
        },
        include: { booking: true }
      }
    }
  });

  // 4. Filter Available Tables & Calculate "Next Booking"
  const availableTables = tables.map(table => {
    // A. Check for overlapping bookings
    const isOccupied = table.bookings.some(tb => {
      const bStart = new Date(`${date}T${tb.booking.time}:00`);
      const bEnd = new Date(bStart.getTime() + 90 * 60000); // 90 min duration assumption
      // Overlap formula
      return (bookingStart < bEnd && bookingEnd > bStart);
    });

    if (isOccupied) return null; // Filter this table out

    // B. Find the NEXT reservation on this table (for the dashboard indicator)
    const futureBookings = table.bookings
      .map(tb => new Date(`${date}T${tb.booking.time}:00`))
      .filter(d => d > bookingStart)
      .sort((a, b) => a.getTime() - b.getTime());

    const nextBookingTime = futureBookings.length > 0 
      ? futureBookings[0].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null; // Null means "Infinity" / Free for the rest of the night

    return {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      nextBookingTime
    };
  }).filter(Boolean); // Remove nulls

  return NextResponse.json(availableTables);
}