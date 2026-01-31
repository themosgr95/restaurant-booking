import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
  
  // 1. Define Range
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  // 2. Fetch Grouped Counts
  // We group by "date" to see how many bookings exist per day
  const bookings = await prisma.booking.groupBy({
    by: ['date'],
    where: {
      date: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
      // Optional: Filter by location if selected
      ...(locationId && locationId !== "all" ? {
         bookingTables: { some: { table: { locationId } } }
      } : {})
    },
    _count: {
      id: true
    }
  });

  // 3. Format as Dictionary: { "2026-01-05": 12, "2026-01-06": 4 }
  const counts: Record<string, number> = {};
  bookings.forEach(b => {
    // Manually format to YYYY-MM-DD to match frontend helpers
    const d = new Date(b.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    counts[dateStr] = b._count.id;
  });

  return NextResponse.json(counts);
}