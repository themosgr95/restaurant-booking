import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, date, time, guests, notes, tableId, locationId } = body;

    // 1. Combine Date and Time into a single DateTime object
    // "date" comes as "2025-08-20" and "time" as "19:30"
    const combinedDate = new Date(`${date}T${time}:00`);

    // 2. Create the Booking
    // We removed the 'time' field because it's now inside 'combinedDate'
    const booking = await prisma.booking.create({
      data: {
        date: combinedDate,       // <--- The Fix: Use the combined DateTime
        guests: parseInt(guests),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes: notes,
        status: "CONFIRMED",
        locationId: locationId,
        tableId: tableId || null, // Optional link to a specific table
      }
    });

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error("Manual Booking Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}