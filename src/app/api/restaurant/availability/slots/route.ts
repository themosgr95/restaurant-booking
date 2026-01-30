import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  const locationId = searchParams.get("locationId");
  const guests = parseInt(searchParams.get("guests") || "2");

  if (!dateStr || !locationId) return NextResponse.json([], { status: 400 });

  // 1. Get Location & Turnover Time
  const location = await prisma.location.findUnique({ where: { id: locationId } });
  const duration = location?.turnoverTime || 90;

  // 2. Find Candidate Tables
  const tables = await prisma.table.findMany({
    where: {
      locationId: locationId,
      capacity: { gte: guests }
    },
    include: {
      bookingTables: {
        where: {
          booking: {
            date: { equals: new Date(dateStr) }
          }
        },
        include: { booking: true }
      }
    }
  });

  if (tables.length === 0) return NextResponse.json([]); // No table fits group

  // 3. Generate Time Slots (Standard 17:00 - 22:00 for now)
  // In a real app, fetch OpeningHours from DB
  const startHour = 17;
  const endHour = 22;
  const timeSlots = [];
  
  for (let h = startHour; h <= endHour; h++) {
    timeSlots.push(`${h}:00`);
    timeSlots.push(`${h}:30`);
  }

  // 4. Filter Available Slots
  const availableSlots = timeSlots.filter(slotTime => {
    const slotStart = new Date(`${dateStr}T${slotTime}:00`);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    // Is there AT LEAST ONE table free for this duration?
    const isAnyTableFree = tables.some(table => {
      // Check collision with existing bookings on this table
      const isBlocked = table.bookingTables.some(bt => {
        const bStart = new Date(`${dateStr}T${bt.booking.time}:00`);
        const bEnd = new Date(bStart.getTime() + duration * 60000); 
        // Overlap Check
        return (slotStart < bEnd && slotEnd > bStart);
      });
      return !isBlocked;
    });

    return isAnyTableFree;
  });

  return NextResponse.json(availableSlots);
}