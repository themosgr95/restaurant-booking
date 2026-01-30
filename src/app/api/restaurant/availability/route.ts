import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const guests = parseInt(searchParams.get("guests") || "2");
  const locationId = searchParams.get("locationId");

  if (!date || !time || !locationId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // NOTE: We removed the strict session check here so the Public Booking Page can uses this API too.
  // If you want to secure this strictly for staff, you would uncomment the lines below, 
  // but then you need a separate API for public users.
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Get Location Info (Fix: Use 'turnoverTime', NOT 'turnoverMinutes')
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    // We don't need 'select' here, just fetch the whole object to be safe
  });

  if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  // 2. Define Slot based on DYNAMIC turnover time
  // Fix: Use the correct field from the database
  const duration = location.turnoverTime || 90; 
  const bookingStart = new Date(`${date}T${time}:00`);
  const bookingEnd = new Date(bookingStart.getTime() + duration * 60000);

  // 3. Find Tables
  const tables = await prisma.table.findMany({
    where: {
      locationId: locationId,
      capacity: { gte: guests }
    },
    include: {
      bookingTables: {
        where: {
          booking: {
            date: { equals: new Date(date) }
          }
        },
        include: { booking: true }
      }
    }
  });

  // 4. Check Availability
  const availableTables = tables.map(table => {
    // Check Overlaps
    const isOccupied = table.bookingTables.some(bt => {
      const bStart = new Date(`${date}T${bt.booking.time}:00`);
      const bEnd = new Date(bStart.getTime() + duration * 60000); 
      return (bookingStart < bEnd && bookingEnd > bStart);
    });

    if (isOccupied) return null;

    // Next Booking Time
    const futureBookings = table.bookingTables
      .map(bt => new Date(`${date}T${bt.booking.time}:00`))
      .filter(d => d > bookingStart)
      .sort((a, b) => a.getTime() - b.getTime());

    const nextBookingTime = futureBookings.length > 0 
      ? futureBookings[0].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    return {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      locationId: table.locationId,
      nextBookingTime
    };
  }).filter(Boolean);

  return NextResponse.json(availableTables);
}