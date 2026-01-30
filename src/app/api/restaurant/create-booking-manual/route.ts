import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table, date, time, guests, name, email, phone, notes } = body;

    // 1. Double Check Availability (The "Lock" Safety Net)
    // (Skipping complex logic for brevity, but this is where you'd prevent race conditions)

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
        restaurantId: table.locationId, // Simplified: In real app, query table->location->restaurant
        bookingTables: {
          create: { tableId: table.id }
        }
      }
    });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}