import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { startDate, endDate, isClosed, opensAt, closesAt, note } = body;

    // Helper: Loop through dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    
    // Safety: Prevent massive loops (limit to 365 days max)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays > 365) return NextResponse.json({ error: "Range too large" }, { status: 400 });

    const operations = [];

    // Loop from start to end date
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Create a specific date object for this iteration
      const currentIso = d.toISOString();
      
      operations.push(
        prisma.specialClosure.upsert({
          where: {
            locationId_date: {
              locationId: params.locationId,
              date: currentIso
            }
          },
          update: { isClosed, opensAt, closesAt, note },
          create: {
            locationId: params.locationId,
            date: currentIso,
            isClosed,
            opensAt,
            closesAt,
            note
          }
        })
      );
    }

    // Execute all database operations
    await prisma.$transaction(operations);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create closure" }, { status: 500 });
  }
}

// DELETE remains the same
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.specialClosure.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}