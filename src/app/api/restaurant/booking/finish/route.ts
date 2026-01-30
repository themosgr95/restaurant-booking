import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId } = await req.json();

    // Update status to COMPLETED (You need to add this status to your Booking model or just rely on logic)
    // For now, let's assume we add a 'status' field to Booking in Prisma, OR we assume completed bookings are handled.
    // A simple hack without migrating schema 'status' enum is to change the 'notes' or just trust the 'completedAt' logic if we added it.
    
    // BETTER WAY: Let's just delete the booking from the timeline view? No, we want record.
    // Let's assume we added 'status' String @default("CONFIRMED") to Booking model in Step 1.
    
    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        // We'll use a notes hack if we didn't update schema for status, 
        // but let's assume you ran `npx prisma db push` with a new status field.
        // For SAFETY now without schema change: 
        notes: { set: "COMPLETED (Customer Left)" } 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}