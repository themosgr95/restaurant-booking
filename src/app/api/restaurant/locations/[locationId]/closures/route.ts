import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Helper type for the params
type RouteContext = {
  params: Promise<{ locationId: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  try {
    const { locationId } = await context.params;
    const { startDate, endDate, reason } = await req.json();

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
    }

    // Loop through each day in the range
    const promises = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d); // Copy date
      
      // Check if closure exists for this specific day
      const existing = await prisma.specialClosure.findFirst({
        where: {
          locationId: locationId,
          date: currentDate
        }
      });

      if (existing) {
        // UPDATE existing
        promises.push(
          prisma.specialClosure.update({
            where: { id: existing.id },
            data: { reason }
          })
        );
      } else {
        // CREATE new
        promises.push(
          prisma.specialClosure.create({
            data: {
              locationId: locationId,
              date: currentDate,
              reason: reason
            }
          })
        );
      }
    }

    await Promise.all(promises);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Closure Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}