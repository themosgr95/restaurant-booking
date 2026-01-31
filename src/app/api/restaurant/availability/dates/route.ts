import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");
    const guests = parseInt(searchParams.get("guests") || "2");
    
    // Parse Year/Month robustly
    const today = new Date();
    const month = parseInt(searchParams.get("month") || today.getMonth().toString());
    const year = parseInt(searchParams.get("year") || today.getFullYear().toString());

    if (!locationId) return NextResponse.json([], { status: 400 });

    // 1. Get Location Rules
    // We fetch a slightly wider range of closures to be safe
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        openingHours: true,
        specialClosures: true, // Fetch all closures to avoid date math errors in query
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
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        bookingTables: { some: { tableId: { in: location.tables.map(t => t.id) } } },
      }
    });

    // 3. Calculate Status (Green/Red)
    const daysInMonth = endDate.getDate(); // e.g., 31
    const dateStatus: Record<string, string> = {}; 

    for (let d = 1; d <= daysInMonth; d++) {
      // FIX: Create the date string MANUALLY to avoid Timezone shifts
      // "2026-01-05"
      const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // Create a specific date object to check the Day of Week (0-6)
      // We set it to Noon (12:00) to safely avoid any DST shifts
      const checkDate = new Date(year, month, d, 12, 0, 0);
      const dayOfWeek = checkDate.getDay(); // 0=Sun, 1=Mon...

      // --- CHECK 1: IS IT CLOSED? ---
      const specialClosure = location.specialClosures.find(c => {
         const cDate = new Date(c.date);
         return cDate.toISOString().split('T')[0] === dayString;
      });
      
      const regularHours = location.openingHours.find(oh => oh.dayOfWeek === dayOfWeek);

      // If closed by special event OR no regular hours exist -> RED
      if ((specialClosure && specialClosure.isClosed) || (!specialClosure && !regularHours)) {
        dateStatus[dayString] = "red";
        continue;
      }

      // --- CHECK 2: CAPACITY ---
      // Compare string-to-string to be 100% sure
      const dayBookings = bookings.filter(b => b.date.toISOString().split('T')[0] === dayString);
      
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