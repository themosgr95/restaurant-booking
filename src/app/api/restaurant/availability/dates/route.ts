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
        openingHours: true,
        specialClosures: true, 
        tables: {
          where: { capacity: { gte: guests } },
          select: { id: true }
        }
      }
    });

    if (!location || location.tables.length === 0) {
      return NextResponse.json({ dates: {} });
    }

    // 2. Fetch Bookings
    // We use a wide range to ensure we catch everything, regardless of timezone
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        bookingTables: { some: { tableId: { in: location.tables.map(t => t.id) } } },
      }
    });

    // 3. Calculate Status
    const daysInMonth = endDate.getDate();
    const dateStatus: Record<string, string> = {}; 

    for (let d = 1; d <= daysInMonth; d++) {
      // FIX: Construct string MANUALLY to guarantee "2026-01-05" stays "2026-01-05"
      const currentMonthStr = String(month + 1).padStart(2, '0');
      const currentDayStr = String(d).padStart(2, '0');
      const dayString = `${year}-${currentMonthStr}-${currentDayStr}`;

      // Create a date at NOON (12:00) to safely check the day of the week
      // This prevents "Midnight" shifting to the previous day
      const checkDate = new Date(year, month, d, 12, 0, 0);
      const dayOfWeek = checkDate.getDay(); // 0=Sun, 1=Mon...

      // --- CHECK 1: IS IT CLOSED? ---
      const specialClosure = location.specialClosures.find(c => {
         // Convert closure date to YYYY-MM-DD string to match
         const cDate = new Date(c.date);
         const cString = cDate.toISOString().split('T')[0];
         return cString === dayString;
      });
      
      const regularHours = location.openingHours.find(oh => oh.dayOfWeek === dayOfWeek);

      // RED if closed by special event OR no regular hours found for this day of week
      if ((specialClosure && specialClosure.isClosed) || (!specialClosure && !regularHours)) {
        dateStatus[dayString] = "red";
        continue;
      }

      // --- CHECK 2: CAPACITY ---
      // Filter bookings by matching the day string exactly
      const dayBookings = bookings.filter(b => {
         const bString = b.date.toISOString().split('T')[0];
         return bString === dayString;
      });
      
      const turnsPerTable = 5; 
      const totalCapacity = location.tables.length * turnsPerTable;
      const percentFull = dayBookings.length / totalCapacity;

      if (percentFull >= 1) dateStatus[dayString] = "orange";
      else if (percentFull >= 0.7) dateStatus[dayString] = "purple";
      else dateStatus[dayString] = "green";
    }

    return NextResponse.json({ dates: dateStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ dates: {} });
  }
}