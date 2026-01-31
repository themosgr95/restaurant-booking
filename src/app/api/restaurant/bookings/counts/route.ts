import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
  
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  // 1. Fetch Bookings
  const bookings = await prisma.booking.groupBy({
    by: ['date'],
    where: {
      date: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
      ...(locationId && locationId !== "all" ? {
         bookingTables: { some: { table: { locationId } } }
      } : {})
    },
    _count: { id: true }
  });

  // 2. Fetch Exceptions (Both Closed AND Special Openings)
  const exceptions = await prisma.specialClosure.findMany({
    where: {
      date: { gte: startDate, lte: endDate }
    }
  });

  const data: Record<string, { bookings: number, isClosed: boolean }> = {};

  // Fill Bookings
  bookings.forEach(b => {
    const d = new Date(b.date);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    if (!data[dateStr]) data[dateStr] = { bookings: 0, isClosed: false };
    data[dateStr].bookings = b._count.id;
  });

  // Apply Exceptions
  exceptions.forEach(c => {
    const d = new Date(c.date);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    
    if (!data[dateStr]) data[dateStr] = { bookings: 0, isClosed: false };
    
    // If exception says closed -> Mark Closed
    // If exception says Open (Special Hours) -> Ensure NOT Closed
    if (c.isClosed) {
      data[dateStr].isClosed = true;
    } else {
      data[dateStr].isClosed = false; // Force open
    }
  });

  return NextResponse.json(data);
}