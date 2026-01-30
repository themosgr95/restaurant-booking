import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");
    const guests = parseInt(searchParams.get("guests") || "2");
    
    // Default to current month/year if not provided
    const today = new Date();
    const month = parseInt(searchParams.get("month") || today.getMonth().toString());
    const year = parseInt(searchParams.get("year") || today.getFullYear().toString());

    if (!locationId) return NextResponse.json([], { status: 400 });

    // 1. Find tables that fit the group size in this location
    const tables = await prisma.table.findMany({
      where: {
        locationId,
        capacity: { gte: guests }
      },
      select: { id: true }
    });

    const tableIds = tables.map(t => t.id);

    // If no tables fit the group size, return empty (locks the calendar)
    if (tableIds.length === 0) {
      return NextResponse.json({ dates: [] });
    }

    // 2. Define the date range for the requested month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // 3. Fetch all bookings for these specific tables in this month
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        bookingTables: {
          some: {
            tableId: { in: tableIds }
          }
        },
        // REMOVED: status: { not: "CANCELLED" } to fix build error
      },
      include: {
        bookingTables: true
      }
    });

    // 4. Calculate "Green" Dates
    const availableDates: string[] = [];
    const daysInMonth = endDate.getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDay = new Date(year, month, d);
      const dayStr = currentDay.toISOString().split('T')[0];

      // Count bookings for this specific day on our candidate tables
      const dayBookings = bookings.filter(b => 
        b.date.toISOString().split('T')[0] === dayStr
      );

      // Simple Availability Logic:
      // If a day has fewer bookings than (NumTables * 5 turns), it's likely available.
      // This keeps the calendar fast. The "Slots" step will do the strict check.
      const totalCapacitySlots = tableIds.length * 5; 
      
      if (dayBookings.length < totalCapacitySlots) {
        availableDates.push(dayStr);
      }
    }

    return NextResponse.json({ dates: availableDates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ dates: [] });
  }
}