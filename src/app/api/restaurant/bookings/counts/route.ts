import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString()); // 0-indexed

  if (!locationId) return NextResponse.json({});

  // 1. Define Date Range
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  try {
    // 2. Get all bookings for the month
    const bookings = await prisma.booking.findMany({
      where: {
        locationId,
        date: {
          gte: startDate,
          lte: endDate
        },
        status: { not: "CANCELLED" }
      }
    });

    // 3. Get Special Closures
    const specialClosures = await prisma.specialClosure.findMany({
      where: {
        locationId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // 4. Aggregate Data
    const data: Record<string, { count: number; isClosed: boolean }> = {};

    // Initialize all days
    for (let d = 1; d <= endDate.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      data[dateStr] = { count: 0, isClosed: false };
    }

    // Fill Counts
    bookings.forEach(b => {
      const dateStr = b.date.toISOString().split('T')[0];
      if (data[dateStr]) {
        data[dateStr].count += b.guests;
      }
    });

    // Fill Closures
    specialClosures.forEach(c => {
      const dateStr = c.date.toISOString().split('T')[0];
      if (data[dateStr]) {
        // FIX: Remove 'if (c.isClosed)' check. 
        // If the record exists, it is closed.
        data[dateStr].isClosed = true; 
      }
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error("Counts Error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}