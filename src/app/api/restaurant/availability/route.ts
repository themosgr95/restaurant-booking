import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  const timeStr = searchParams.get("time"); // HH:MM
  const locationId = searchParams.get("locationId");
  const guests = parseInt(searchParams.get("guests") || "2");

  if (!dateStr || !timeStr || !locationId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // 1. Get Location Settings & All Tables
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: { tables: true }
    });

    if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

    // 2. Define the Requested Time Slot
    const turnoverMinutes = location.turnoverTime || 90;
    const requestedStart = new Date(`${dateStr}T${timeStr}:00`);
    const requestedEnd = new Date(requestedStart.getTime() + turnoverMinutes * 60000);

    // 3. Get Bookings for this Location on this Date
    // We fetch all bookings for the day to check for overlaps in memory (faster/easier)
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59`);

    const existingBookings = await prisma.booking.findMany({
      where: {
        locationId: locationId,
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        status: { not: "CANCELLED" }
      }
    });

    // 4. Find Available Tables
    const availableTables = location.tables.filter((table) => {
      // Filter by capacity first
      if (table.capacity < guests) return false;

      // Check for conflicts
      const isTaken = existingBookings.some((booking) => {
        if (booking.tableId !== table.id) return false; // Different table, no conflict

        const bookingStart = new Date(booking.date);
        const bookingEnd = new Date(bookingStart.getTime() + turnoverMinutes * 60000);

        // Check for overlap: (StartA < EndB) and (EndA > StartB)
        return (requestedStart < bookingEnd && requestedEnd > bookingStart);
      });

      return !isTaken;
    });

    return NextResponse.json({ 
      available: availableTables.length > 0,
      tables: availableTables 
    });

  } catch (error) {
    console.error("Availability Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}