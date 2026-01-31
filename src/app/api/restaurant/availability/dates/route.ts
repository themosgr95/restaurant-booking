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
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        bookingTables: { some: { tableId: { in: location.tables.map(t => t.id) } } },
        status: { not: "CANCELLED" }
      }
    });

    // 3. Calculate Status
    const daysInMonth = endDate.getDate();
    const dateStatus: Record<string, string> = {}; 

    for (let d = 1; d <= daysInMonth; d++) {
      const currentMonthStr = String(month + 1).padStart(2, '0');
      const currentDayStr = String(d).padStart(2, '0');
      const dayString = `${year}-${currentMonthStr}-${currentDayStr}`;

      const checkDate = new Date(year, month, d, 12, 0, 0);
      const dayOfWeek = checkDate.getDay(); 

      // --- RULE CHECKING ---
      const specialRule = location.specialClosures.find(c => {
         const cDate = new Date(c.date);
         return cDate.toISOString().split('T')[0] === dayString;
      });
      
      const regularHours = location.openingHours.find(oh => oh.dayOfWeek === dayOfWeek);

      let isOpen = false;

      if (specialRule) {
        // If there is a rule, IT DECIDES everything.
        // If isClosed = true -> Closed.
        // If isClosed = false (Special Hours) -> Open!
        isOpen = !specialRule.isClosed;
      } else {
        // No special rule? Fallback to regular hours.
        isOpen = !!regularHours;
      }

      if (!isOpen) {
        dateStatus[dayString] = "red";
        continue;
      }

      // --- CAPACITY CHECK (Only if Open) ---
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