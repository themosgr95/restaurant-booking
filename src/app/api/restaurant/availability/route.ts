import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId") ?? "";
    const date = searchParams.get("date") ?? ""; // YYYY-MM-DD
    const time = searchParams.get("time") ?? ""; // HH:mm
    const guestsRaw = searchParams.get("guests") ?? "0";
    const guests = Math.max(1, Number(guestsRaw) || 0);

    if (!locationId || !date || !time || !guests) {
      return NextResponse.json(
        { error: "Missing required params: locationId, date, time, guests" },
        { status: 400 }
      );
    }

    const start = new Date(`${date}T${time}:00`);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true, turnoverMinutes: true },
    });

    if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

    const turnoverMinutes = Math.max(15, Number(location.turnoverMinutes) || 120);
    const end = new Date(start.getTime() + turnoverMinutes * 60 * 1000);

    // Special closure override
    const special = await prisma.specialClosure.findFirst({
      where: { locationId, date },
      select: { isClosed: true, opensAt: true, closesAt: true },
    });

    if (special?.isClosed) {
      return NextResponse.json({ availableTables: [] });
    }

    // Normal opening hours
    const dayOfWeek = new Date(`${date}T00:00:00`).getDay(); // 0 Sun .. 6 Sat
    const hours = await prisma.openingHour.findFirst({
      where: { locationId, dayOfWeek },
      select: { opensAt: true, closesAt: true },
    });

    const opensAt = (special?.opensAt ?? hours?.opensAt) || null;
    const closesAt = (special?.closesAt ?? hours?.closesAt) || null;

    if (!opensAt || !closesAt) {
      return NextResponse.json({ availableTables: [] });
    }

    const openDt = new Date(`${date}T${opensAt}:00`);
    const closeDt = new Date(`${date}T${closesAt}:00`);

    // Must be fully inside opening window
    if (start < openDt || end > closeDt) {
      return NextResponse.json({ availableTables: [] });
    }

    const candidateTables = await prisma.table.findMany({
      where: { locationId, capacity: { gte: guests } },
      orderBy: [{ capacity: "asc" }],
    });

    if (candidateTables.length === 0) {
      return NextResponse.json({ availableTables: [] });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        locationId,
        date,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      select: { tableId: true, time: true, turnoverMinutes: true },
    });

    const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
      aStart < bEnd && bStart < aEnd;

    const availableTables = candidateTables.filter((table) => {
      for (const b of bookings) {
        if (b.tableId !== table.id) continue;

        const bTurnover = Math.max(15, Number(b.turnoverMinutes) || turnoverMinutes);
        const bStart = new Date(`${date}T${b.time}:00`);
        const bEnd = new Date(bStart.getTime() + bTurnover * 60 * 1000);

        if (overlaps(start, end, bStart, bEnd)) return false;
      }
      return true;
    });

    return NextResponse.json({ availableTables });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
