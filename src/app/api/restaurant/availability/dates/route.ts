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

    // 1. Get Location Rules (Hours & Closures)
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        openingHours: true,
        specialClosures: {
          where: {
            date: {
              gte: new Date(year, month, 1),
              lte: new Date(year, month + 1, 0)
            }
          }
        },
        tables: {
          where: { capacity: { gte: guests } },
          select: { id: true }
        }
      }
    });

    if (!location || location.tables.length === 0) {
      return NextResponse.json({ dates: {} });
    }

    // 2. Fetch Bookings for the Month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        bookingTables: { some: { tableId: { in: location.tables.map(t => t.id) } } },
        // REMOVED: status: { not: "CANCELLED" } 
      }
    });

    // 3. Calculate Status for Each Day
    const daysInMonth = endDate.getDate();
    const dateStatus: Record<string, string> = {}; 

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDay = new Date(year, month, d);
      const dayStr = currentDay.toISOString().split('T')[0];
      const dayOfWeek = currentDay.getDay(); 

      // --- CHECK 1: IS IT CLOSED? (RED) ---
      const specialClosure = location.specialClosures.find(c => c.date.toISOString().split('T')[0] === dayStr);
      const regularHours = location.openingHours.find(oh => oh.dayOfWeek === dayOfWeek);

      if ((specialClosure && specialClosure.isClosed) || (!specialClosure && !regularHours)) {
        dateStatus[dayStr] = "red";
        continue;
      }

      // --- CHECK 2: CAPACITY (ORANGE / PURPLE / GREEN) ---
      const dayBookings = bookings.filter(b => b.date.toISOString().split('T')[0] === dayStr);
      
      const turnsPerTable = 5; 
      const totalCapacity = location.tables.length * turnsPerTable;
      const percentFull = dayBookings.length / totalCapacity;

      if (percentFull >= 1) {
        dateStatus[dayStr] = "orange"; // Full
      } else if (percentFull >= 0.7) {
        dateStatus[dayStr] = "purple"; // Limited
      } else {
        dateStatus[dayStr] = "green"; // Available
      }
    }

    return NextResponse.json({ dates: dateStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ dates: {} });
  }
}