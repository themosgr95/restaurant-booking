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

    // 1. Fetch the Table to get the correct Restaurant ID
    // (We cannot just use locationId as restaurantId)
    const tableData = await prisma.table.findUnique({
      where: { id: table.id },
      include: { location: true } // This gives us location.restaurantId
    });

    if (!tableData) return NextResponse.json({ error: "Table not found" }, { status: 404 });

    // 2. Create Booking linked to the correct Restaurant
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        time,
        guests: parseInt(guests),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes,
        restaurantId: tableData.location.restaurantId, // FIX: Use the actual Restaurant ID
        bookingTables: {
          create: { tableId: table.id }
        }
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}