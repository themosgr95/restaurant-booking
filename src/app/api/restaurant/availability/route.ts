import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { table, date, time, guests, name, email, phone, notes } = body;

    // 1. Fetch the Table to get the REAL Restaurant ID
    // We cannot trust 'table.locationId' to be the 'restaurantId' directly
    const tableData = await prisma.table.findUnique({
      where: { id: table.id },
      include: { location: true } // This includes the relation to the Restaurant ID
    });

    if (!tableData) return NextResponse.json({ error: "Table not found" }, { status: 404 });

    // 2. Create Booking
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        time,
        guests: parseInt(guests),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes,
        // FIX: Use the restaurantId found via the location relation
        restaurantId: tableData.location.restaurantId,
        bookingTables: {
          create: { tableId: table.id }
        }
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Manual Booking Error:", error); // Check your terminal for this log if it fails again
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}