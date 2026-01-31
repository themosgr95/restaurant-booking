import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
  
  // 1. Define Range
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));

  // 2. Fetch Bookings (Orange Dots)
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

  // 3. Fetch CLOSED Days (Red Dots)
  // We need to check if there is a 'SpecialClosure' for any date in this month
  const closures = await prisma.specialClosure.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      isClosed: true
    }
  });

  // 4. Build Response
  const data: Record<string, { bookings: number, isClosed: boolean }> = {};

  // Fill bookings
  bookings.forEach(b => {
    const d = new Date(b.date);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    if (!data[dateStr]) data[dateStr] = { bookings: 0, isClosed: false };
    data[dateStr].bookings = b._count.id;
  });

  // Fill closures
  closures.forEach(c => {
    const d = new Date(c.date);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    if (!data[dateStr]) data[dateStr] = { bookings: 0, isClosed: false };
    data[dateStr].isClosed = true;
  });

  return NextResponse.json(data);
}