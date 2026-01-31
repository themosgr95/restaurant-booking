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

    if (!location || location.tables.length === 0) return NextResponse.json({ dates: {} });

    // Use wide range for DB Query
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        bookingTables: { some: { tableId: { in: location.tables.map(t => t.id) } } },
      }
    });

    const daysInMonth = endDate.getDate();
    const dateStatus: Record<string, string> = {}; 

    for (let d = 1; d <= daysInMonth; d++) {
      // FIX: Manual String Construction to match Frontend
      const currentMonthStr = String(month + 1).padStart(2, '0');
      const currentDayStr = String(d).padStart(2, '0');
      const dayString = `${year}-${currentMonthStr}-${currentDayStr}`;

      // FIX: Noon Date for DayOfWeek check
      const checkDate = new Date(year, month, d, 12, 0, 0);
      const dayOfWeek = checkDate.getDay(); 

      const specialClosure = location.specialClosures.find(c => {
         const cDate = new Date(c.date);
         return cDate.toISOString().split('T')[0] === dayString;
      });
      const regularHours = location.openingHours.find(oh => oh.dayOfWeek === dayOfWeek);

      if ((specialClosure && specialClosure.isClosed) || (!specialClosure && !regularHours)) {
        dateStatus[dayString] = "red";
        continue;
      }

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
    return NextResponse.json({ dates: {} });
  }
}