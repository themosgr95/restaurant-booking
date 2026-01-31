import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { date, time, guests, customerName, customerEmail, customerPhone, notes, locationId, tableId } = body;

    if (!date || !time || !guests || !locationId || !customerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date), // Ensure this is a Date object
        time: time,           // <--- THIS WAS MISSING
        guests: parseInt(guests),
        customerName,
        customerEmail,
        customerPhone,
        notes,
        status: "CONFIRMED",
        locationId,
        tableId: tableId || null, // Optional
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Failed to create manual booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}