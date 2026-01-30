import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const guests = parseInt(searchParams.get("guests") || "2");
  const locationId = searchParams.get("locationId");

  if (!date || !time || !locationId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const location = await prisma.location.findUnique({
    where: { id: locationId }
  });

  if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

  const duration = location.turnoverTime || 90; 
  const bookingStart = new Date(`${date}T${time}:00`);
  const bookingEnd = new Date(bookingStart.getTime() + duration * 60000);

  const tables = await prisma.table.findMany({
    where: {
      locationId: locationId,
      capacity: { gte: guests } 
    },
    include: {
      bookingTables: {
        where: {
          booking: {
            date: { equals: new Date(date) }
          }
        },
        include: { booking: true }
      }
    }
  });

  const availableTables = tables.map(table => {
    const isOccupied = table.bookingTables.some(bt => {
      const bStart = new Date(`${date}T${bt.booking.time}:00`);
      const bEnd = new Date(bStart.getTime() + duration * 60000); 
      return (bookingStart < bEnd && bookingEnd > bStart);
    });

    if (isOccupied) return null;

    const futureBookings = table.bookingTables
      .map(bt => new Date(`${date}T${bt.booking.time}:00`))
      .filter(d => d > bookingStart)
      .sort((a, b) => a.getTime() - b.getTime());

    const nextBookingTime = futureBookings.length > 0 
      ? futureBookings[0].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    return {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      locationId: table.locationId,
      nextBookingTime
    };
  }).filter(Boolean);

  return NextResponse.json(availableTables);
}