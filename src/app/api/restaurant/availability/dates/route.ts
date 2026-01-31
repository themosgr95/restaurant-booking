import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");
    const guests = parseInt(searchParams.get("guests") || "2");
    
    const today = new Date();
    const month = parseInt(searchParams.get("month") || today.getMonth().toString());
    const year = parseInt(searchParams.get("year") || today.getFullYear().toString());

    if (!locationId) return NextResponse.json([], { status: 400 });

    // 1. Get Location Rules
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        openingHours: true, // We need this to know when you are open
        specialClosures: {
          where: {
            date: {
              gte: new Date(Date.UTC(year, month, 1)),
              lte: new Date(Date.UTC(year, month + 1, 0))
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

    // 2. Fetch Bookings (Using UTC to prevent timezone shifts)
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0));

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        bookingTables: { some: { tableId: { in: location.tables.map(t => t.id) } } },
        // Status check removed as requested previously
      }
    });

    // 3. Calculate Status for Each Day
    const daysInMonth = endDate.getUTCDate();
    const dateStatus: Record<string, string> = {}; 

    for (let d = 1; d <= daysInMonth; d++) {
      // FIX: Use UTC to ensure Jan 5 is actually treated as Jan 5 (Monday)
      const currentDay = new Date(Date.UTC(year, month, d));
      const dayStr = currentDay.toISOString().split('T')[0];
      const dayOfWeek = currentDay.getUTCDay(); // 0=Sun, 1=Mon, etc.

      // --- CHECK 1: IS IT CLOSED? (RED) ---
      const specialClosure = location.specialClosures.find(c => c.date.toISOString().split('T')[0] === dayStr);
      
      // Match the day of week (e.g. 1 for Monday) with your Opening Hours database
      const regularHours = location.openingHours.find(oh => oh.dayOfWeek === dayOfWeek);

      // Logic: If closed by special event OR no regular hours exist for this day -> RED
      if ((specialClosure && specialClosure.isClosed) || (!specialClosure && !regularHours)) {
        dateStatus[dayStr] = "red";
        continue;
      }

      // --- CHECK 2: CAPACITY ---
      const dayBookings = bookings.filter(b => b.date.toISOString().split('T')[0] === dayStr);
      const turnsPerTable = 5; 
      const totalCapacity = location.tables.length * turnsPerTable;
      const percentFull = dayBookings.length / totalCapacity;

      if (percentFull >= 1) dateStatus[dayStr] = "orange";
      else if (percentFull >= 0.7) dateStatus[dayStr] = "purple";
      else dateStatus[dayStr] = "green";
    }

    return NextResponse.json({ dates: dateStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ dates: {} });
  }
}