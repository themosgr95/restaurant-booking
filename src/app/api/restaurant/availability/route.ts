import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  const time = searchParams.get("time"); // HH:mm
  const guests = parseInt(searchParams.get("guests") || "2");
  const locationId = searchParams.get("locationId"); // <--- NEW PARAMETER

  if (!date || !time || !locationId) {
    return NextResponse.json({ error: "Missing date, time, or location" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Define the Booking Slot (Assume 90 min duration)
  const bookingStart = new Date(`${date}T${time}:00`);
  const bookingEnd = new Date(bookingStart.getTime() + 90 * 60000);

  // 2. Find tables ONLY for the selected location
  const tables = await prisma.table.findMany({
    where: {
      locationId: locationId, // <--- STRICT FILTERING HERE
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

  // 3. Filter Available Tables & Calculate "Next Booking"
  const availableTables = tables.map(table => {
    // A. Check for overlapping bookings
    const isOccupied = table.bookingTables.some(bt => {
      const bStart = new Date(`${date}T${bt.booking.time}:00`);
      const bEnd = new Date(bStart.getTime() + 90 * 60000); // 90 min duration
      
      return (bookingStart < bEnd && bookingEnd > bStart);
    });

    if (isOccupied) return null;

    // B. Find the NEXT reservation on this table
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
      locationId: table.locationId, // Ensure frontend receives this
      nextBookingTime
    };
  }).filter(Boolean); // Remove nulls

  return NextResponse.json(availableTables);
}