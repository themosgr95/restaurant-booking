import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id } = await params;
    const bookingId = id;

    // ACTION 1: STATUS CHANGE (Cancel / Confirm / Completed)
    if (body.status) {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: body.status }
      });
      return NextResponse.json(updated);
    }

    // ACTION 2: TRANSFER (Move to new Date/Time/Table)
    if (body.transfer) {
      // 1. Clear old table links
      await prisma.bookingTable.deleteMany({ where: { bookingId: bookingId } });

      // 2. Update Booking & Link New Table
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          date: new Date(body.date),
          time: body.time,
          bookingTables: { create: { tableId: body.tableId } }
        }
      });
      return NextResponse.json(updated);
    }

    // ACTION 3: EDIT DETAILS (Name, Email, Phone, Notes)
    // If none of the above special actions, check for data updates
    if (body.customerName || body.notes !== undefined || body.customerPhone !== undefined) {
       const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          notes: body.notes
        }
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No valid action" }, { status: 400 });

  } catch (error) {
    console.error("Booking Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}