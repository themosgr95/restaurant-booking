import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());

  if (!locationId) return NextResponse.json({});

  // 1. Get Location & Tables (to know total capacity)
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    include: { tables: true }
  });

  if (!location) return NextResponse.json({});

  const totalCapacity = location.tables.reduce((sum, t) => sum + t.capacity, 0);

  // 2. Define Date Range (Start to End of Month)
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  // 3. Get Bookings for this Location directly (Fixed Query)
  const bookings = await prisma.booking.findMany({
    where: {
      locationId: locationId, // <--- This is the fix (much simpler!)
      date: {
        gte: startDate,
        lte: endDate
      },
      status: { not: "CANCELLED" }
    }
  });

  // 4. Calculate Status per Day
  const dateStatuses: Record<string, string> = {};
  
  // Loop through every day of the month
  for (let d = 1; d <= endDate.getDate(); d++) {
    const currentDay = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Sum up guests for this specific day
    const dayBookings = bookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate.getDate() === d && bDate.getMonth() === month;
    });

    const guestsBooked = dayBookings.reduce((sum, b) => sum + b.guests, 0);

    // Determine Color Status
    if (guestsBooked === 0) {
      dateStatuses[dateStr] = "green"; // Wide open
    } else if (guestsBooked >= totalCapacity * 0.9) { // 90% full
      dateStatuses[dateStr] = "red";   // Full
    } else if (guestsBooked >= totalCapacity * 0.5) { // 50% full
      dateStatuses[dateStr] = "orange"; // Busy
    } else {
      dateStatuses[dateStr] = "green"; // Available
    }
  }

  return NextResponse.json({ dates: dateStatuses });
}