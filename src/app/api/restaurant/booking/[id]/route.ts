import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Define the type for the dynamic route context
type RouteContext = {
  params: Promise<{ id: string }>;
};

// DELETE a booking
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.booking.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// UPDATE a booking
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const bookingId = id;
    
    const body = await req.json();

    // 2. Handle "Transfer" (Moving a booking to a different table)
    if (body.transfer) {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          tableId: body.tableId,
          status: "SEATED"
        }
      });
      return NextResponse.json(updated);
    }

    // 3. Handle simple Status changes
    if (body.status) {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: body.status }
      });
      return NextResponse.json(updated);
    }

    // 4. Handle Notes update
    if (body.notes !== undefined) {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { notes: body.notes }
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}