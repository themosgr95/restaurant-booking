import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // "2026-01-05"
  const locationId = searchParams.get("locationId");
  const guests = parseInt(searchParams.get("guests") || "2");

  if (!dateStr || !locationId) return NextResponse.json([], { status: 400 });

  // FIX: Parse "2026-01-05" manually to avoid timezone shift
  const [y, m, d] = dateStr.split('-').map(Number);
  // Create date at NOON (12:00) to strictly identify the Day of Week
  const targetDate = new Date(y, m - 1, d, 12, 0, 0); 
  const dayOfWeek = targetDate.getDay(); 

  // 1. Get Location & Opening Hours for THIS Day
  const location = await prisma.location.findUnique({ 
    where: { id: locationId },
    include: {
      openingHours: {
        where: { dayOfWeek: dayOfWeek }
      }
    }
  });

  // If no hours found -> Closed
  if (!location || location.openingHours.length === 0) {
    return NextResponse.json([]); 
  }

  const hours = location.openingHours[0]; 
  const duration = location.turnoverTime || 90;

  // 2. Find Tables
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

  if (tables.length === 0) return NextResponse.json([]);

  // 3. Generate Times
  const [startH, startM] = hours.opensAt.split(':').map(Number);
  const [endH, endM] = hours.closesAt.split(':').map(Number);
  
  const timeSlots = [];
  
  // Use a neutral date (Year 2000) to generate time strings without DST issues
  let currentSlot = new Date(2000, 0, 1, startH, startM);
  const closeTime = new Date(2000, 0, 1, endH, endM);

  while (currentSlot < closeTime) {
    const timeString = currentSlot.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    timeSlots.push(timeString);
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }

  // 4. Filter Available
  const availableSlots = timeSlots.filter(slotTime => {
    const slotStart = new Date(`${dateStr}T${slotTime}:00`);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    const isAnyTableFree = tables.some(table => {
      const isBlocked = table.bookingTables.some(bt => {
        const bStart = new Date(`${dateStr}T${bt.booking.time}:00`);
        const bEnd = new Date(bStart.getTime() + duration * 60000); 
        return (slotStart < bEnd && slotEnd > bStart);
      });
      return !isBlocked;
    });

    return isAnyTableFree;
  });

  return NextResponse.json(availableSlots);
}