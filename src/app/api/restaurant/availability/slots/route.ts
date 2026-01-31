import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // "2026-02-04"
  const locationId = searchParams.get("locationId");
  const guests = parseInt(searchParams.get("guests") || "2");

  if (!dateStr || !locationId) return NextResponse.json([], { status: 400 });

  // Parse Date
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(y, m - 1, d)); // UTC to match DB storage
  const dayOfWeek = targetDate.getUTCDay();

  // 1. CHECK FOR SPECIAL EXCEPTIONS FIRST
  const exception = await prisma.specialClosure.findFirst({
    where: {
      locationId: locationId,
      date: targetDate
    }
  });

  // If closed by exception -> Return empty
  if (exception && exception.isClosed) {
    return NextResponse.json([]); 
  }

  // If exception has Special Hours -> Use them!
  let openTime = "";
  let closeTime = "";

  if (exception && !exception.isClosed && exception.opensAt && exception.closesAt) {
     // CASE A: Special Hours (e.g. 22:00 - 23:00)
     openTime = exception.opensAt;
     closeTime = exception.closesAt;
  } else {
     // CASE B: Regular Weekly Schedule
     const location = await prisma.location.findUnique({ 
        where: { id: locationId },
        include: {
          openingHours: { where: { dayOfWeek: dayOfWeek } }
        }
      });

      if (!location || location.openingHours.length === 0) return NextResponse.json([]);
      
      openTime = location.openingHours[0].opensAt;
      closeTime = location.openingHours[0].closesAt;
  }

  // 2. FETCH TABLES (Common Logic)
  const duration = 90; // Default turnover
  const tables = await prisma.table.findMany({
    where: { locationId, capacity: { gte: guests } },
    include: {
      bookingTables: {
        where: {
          booking: {
            date: targetDate,
            status: { not: "CANCELLED" }
          }
        },
        include: { booking: true }
      }
    }
  });

  if (tables.length === 0) return NextResponse.json([]);

  // 3. GENERATE SLOTS
  const [startH, startM] = openTime.split(':').map(Number);
  const [endH, endM] = closeTime.split(':').map(Number);
  
  const timeSlots = [];
  let currentSlot = new Date(2000, 0, 1, startH, startM);
  const closingTime = new Date(2000, 0, 1, endH, endM);

  while (currentSlot < closingTime) {
    const timeString = currentSlot.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    timeSlots.push(timeString);
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }

  // 4. APPLY "TODAY" BUFFER (30 mins)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  if (dateStr === todayStr) {
    const cutoffTime = new Date(now.getTime() + 30 * 60000);
    const cutoffH = cutoffTime.getHours();
    const cutoffM = cutoffTime.getMinutes();
    
    // Filter out past slots
    const filtered = [];
    for(const t of timeSlots) {
       const [h, m] = t.split(':').map(Number);
       if (h > cutoffH || (h === cutoffH && m >= cutoffM)) filtered.push(t);
    }
    // Swap the list
    timeSlots.length = 0;
    timeSlots.push(...filtered);
  }

  // 5. CHECK COLLISIONS
  const availableSlots = timeSlots.filter(slotTime => {
    const slotStart = new Date(`${dateStr}T${slotTime}:00`);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    // Is at least one table free?
    return tables.some(table => {
      const isBlocked = table.bookingTables.some(bt => {
        const bStart = new Date(`${dateStr}T${bt.booking.time}:00`);
        const bEnd = new Date(bStart.getTime() + duration * 60000); 
        return (slotStart < bEnd && slotEnd > bStart);
      });
      return !isBlocked;
    });
  });

  return NextResponse.json(availableSlots);
}