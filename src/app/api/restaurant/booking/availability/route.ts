import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { addMinutes, parseISO, setHours, setMinutes, startOfDay, endOfDay } from "date-fns";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, time, guests, locationId } = body;

    if (!date || !time || !guests || !locationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const partySize = parseInt(guests);
    const DURATION_MINUTES = 90; 

    // 1. Calculate the Requested Time Window
    // Parse the incoming "YYYY-MM-DD" and "HH:mm" into a real Date object
    const [hours, minutes] = time.split(":").map(Number);
    const requestedDateObj = parseISO(date); // This is the day
    
    const requestedStart = setMinutes(setHours(requestedDateObj, hours), minutes);
    const requestedEnd = addMinutes(requestedStart, DURATION_MINUTES);

    // 2. Find Candidates: Tables big enough
    const candidateTables = await prisma.table.findMany({
      where: {
        locationId: locationId,
        capacity: { gte: partySize },
      },
    });

    if (candidateTables.length === 0) {
      return NextResponse.json({ available: false, message: "No tables large enough." });
    }

    // 3. Find Conflicts: Fetch ALL bookings for this specific Day
    // We fetch by Date, then check the exact times in code below
    const dayStart = startOfDay(requestedDateObj);
    const dayEnd = endOfDay(requestedDateObj);

    const daysBookings = await prisma.booking.findMany({
      where: {
        locationId: locationId,
        status: { notIn: ["CANCELLED", "REJECTED"] },
        tableId: { in: candidateTables.map((t) => t.id) },
        // Check if the booking date falls within this day
        date: {
            gte: dayStart,
            lte: dayEnd
        }
      },
    });

    // 4. Filter out busy tables using Javascript logic
    const busyTableIds = new Set();

    for (const booking of daysBookings) {
        // Construct the booking's start/end time from its stored "time" string
        if (booking.time) {
            const [bHours, bMinutes] = booking.time.split(":").map(Number);
            const bookingStart = setMinutes(setHours(requestedDateObj, bHours), bMinutes);
            const bookingEnd = addMinutes(bookingStart, DURATION_MINUTES);

            // Check overlap: (StartA < EndB) and (EndA > StartB)
            if (bookingStart < requestedEnd && bookingEnd > requestedStart) {
                if (booking.tableId) busyTableIds.add(booking.tableId);
            }
        }
    }

    // 5. Determine Available Tables
    const availableTables = candidateTables.filter((table) => !busyTableIds.has(table.id));

    if (availableTables.length > 0) {
      return NextResponse.json({ 
        available: true, 
        tableId: availableTables[0].id,
        allOptions: availableTables 
      });
    } else {
      return NextResponse.json({ available: false, message: "No time slots available." });
    }

  } catch (error) {
    console.error("Availability Check Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}