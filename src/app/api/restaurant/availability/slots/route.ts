import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // "2026-01-31"
  const locationId = searchParams.get("locationId");
  const guests = parseInt(searchParams.get("guests") || "2");

  if (!dateStr || !locationId) return NextResponse.json([], { status: 400 });

  // Parse Date Manually to avoid Timezone Shifts
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d, 12, 0, 0); 
  const dayOfWeek = targetDate.getDay(); 

  // 1. Get Location & Hours
  const location = await prisma.location.findUnique({ 
    where: { id: locationId },
    include: {
      openingHours: {
        where: { dayOfWeek: dayOfWeek }
      }
    }
  });

  if (!location || location.openingHours.length === 0) {
    return NextResponse.json([]); 
  }

  const hours = location.openingHours[0]; 
  const duration = location.turnoverTime || 90;

  // 2. Find Tables (ignoring CANCELLED bookings)
  const tables = await prisma.table.findMany({
    where: {
      locationId: locationId,
      capacity: { gte: guests }
    },
    include: {
      bookingTables: {
        where: {
          booking: {
            date: { equals: new Date(dateStr) },
            // CRITICAL FIX: Ignore cancelled bookings so the slot becomes free
            status: { not: "CANCELLED" } 
          }
        },
        include: { booking: true }
      }
    }
  });

  if (tables.length === 0) return NextResponse.json([]);

  // 3. Generate Time Slots
  const [startH, startM] = hours.opensAt.split(':').map(Number);
  const [endH, endM] = hours.closesAt.split(':').map(Number);
  
  const timeSlots = [];
  
  // Use a neutral date (Year 2000) for generation
  let currentSlot = new Date(2000, 0, 1, startH, startM);
  const closeTime = new Date(2000, 0, 1, endH, endM);

  while (currentSlot < closeTime) {
    const timeString = currentSlot.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    timeSlots.push(timeString);
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }

  // 4. RULE: 30-Minute Buffer for "Today"
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let finalSlots = timeSlots;

  // Only apply buffer if the requested date is TODAY
  if (dateStr === todayStr) {
    // Calculate cutoff time (Now + 30 mins)
    const cutoffTime = new Date(now.getTime() + 30 * 60000);
    const cutoffH = cutoffTime.getHours();
    const cutoffM = cutoffTime.getMinutes();

    finalSlots = timeSlots.filter(slot => {
       const [h, m] = slot.split(':').map(Number);
       // Keep slot only if it is LATER than cutoff
       if (h > cutoffH) return true;
       if (h === cutoffH && m >= cutoffM) return true;
       return false;
    });
  }

  // 5. Filter for Availability (Check Collisions)
  const availableSlots = finalSlots.filter(slotTime => {
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