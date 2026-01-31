import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // "2026-01-05"
  const locationId = searchParams.get("locationId");
  const guests = parseInt(searchParams.get("guests") || "2");

  if (!dateStr || !locationId) return NextResponse.json([], { status: 400 });

  // FIX: Parse manually to ensure correct Day of Week
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d, 12, 0, 0); // Noon to match Dates API
  const dayOfWeek = targetDate.getDay(); 

  // 1. Get Location & Opening Hours
  const location = await prisma.location.findUnique({ 
    where: { id: locationId },
    include: {
      openingHours: {
        where: { dayOfWeek: dayOfWeek }
      }
    }
  });

  // If no hours found for this day -> Closed
  if (!location || location.openingHours.length === 0) {
    return NextResponse.json([]); 
  }

  const hours = location.openingHours[0]; 
  const duration = location.turnoverTime || 90;

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

  if (tables.length === 0) return NextResponse.json([]);

  // 3. Generate Time Slots DYNAMICALLY (09:00 - 17:00)
  const [startH, startM] = hours.opensAt.split(':').map(Number);
  const [endH, endM] = hours.closesAt.split(':').map(Number);
  
  const timeSlots = [];
  
  // Use a temporary date just for generating time strings
  // We use 2000-01-01 to avoid DST issues during time generation
  let currentSlot = new Date(2000, 0, 1, startH, startM);
  const closeTime = new Date(2000, 0, 1, endH, endM);

  while (currentSlot < closeTime) {
    // Force "en-GB" (24h format) to match database strings
    const timeString = currentSlot.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    timeSlots.push(timeString);
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }

  // 4. Filter Available Slots
  const availableSlots = timeSlots.filter(slotTime => {
    // Construct real Date objects for collision checking
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