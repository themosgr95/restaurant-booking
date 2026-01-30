import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60 * 1000);
}
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId") ?? "";
    const date = searchParams.get("date") ?? ""; // YYYY-MM-DD
    const guests = Math.max(1, Number(searchParams.get("guests") ?? "0") || 0);

    if (!locationId || !date || !guests) {
      return NextResponse.json({ error: "Missing required params: locationId, date, guests" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { turnoverMinutes: true },
    });
    if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

    const turnoverMinutes = Math.max(15, Number(location.turnoverMinutes) || 120);

    const special = await prisma.specialClosure.findFirst({
      where: { locationId, date },
      select: { isClosed: true, opensAt: true, closesAt: true },
    });
    if (special?.isClosed) return NextResponse.json({ slots: [] });

    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
    const hours = await prisma.openingHour.findFirst({
      where: { locationId, dayOfWeek },
      select: { opensAt: true, closesAt: true },
    });

    const opensAt = (special?.opensAt ?? hours?.opensAt) || null;
    const closesAt = (special?.closesAt ?? hours?.closesAt) || null;
    if (!opensAt || !closesAt) return NextResponse.json({ slots: [] });

    const openDt = new Date(`${date}T${opensAt}:00`);
    const closeDt = new Date(`${date}T${closesAt}:00`);
    const lastStart = addMinutes(closeDt, -turnoverMinutes);
    if (lastStart < openDt) return NextResponse.json({ slots: [] });

    const tables = await prisma.table.findMany({
      where: { locationId, capacity: { gte: guests } },
      select: { id: true },
    });
    if (tables.length === 0) return NextResponse.json({ slots: [] });

    const bookings = await prisma.booking.findMany({
      where: { locationId, date, status: { in: ["CONFIRMED", "PENDING"] } },
      select: { tableId: true, time: true, turnoverMinutes: true },
    });

    const intervalsByTable = new Map<string, Array<{ start: Date; end: Date }>>();
    for (const b of bookings) {
      const bTurn = Math.max(15, Number(b.turnoverMinutes) || turnoverMinutes);
      const bStart = new Date(`${date}T${b.time}:00`);
      const bEnd = addMinutes(bStart, bTurn);
      const arr = intervalsByTable.get(b.tableId) ?? [];
      arr.push({ start: bStart, end: bEnd });
      intervalsByTable.set(b.tableId, arr);
    }

    const slots: string[] = [];

    for (let t = new Date(openDt); t <= lastStart; t = addMinutes(t, 15)) {
      const slotStart = t;
      const slotEnd = addMinutes(slotStart, turnoverMinutes);

      let anyFree = false;
      for (const table of tables) {
        const ivs = intervalsByTable.get(table.id) ?? [];
        const conflict = ivs.some((iv) => overlaps(slotStart, slotEnd, iv.start, iv.end));
        if (!conflict) {
          anyFree = true;
          break;
        }
      }

      if (anyFree) {
        const hh = String(slotStart.getHours()).padStart(2, "0");
        const mm = String(slotStart.getMinutes()).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
      }
    }

    return NextResponse.json({ slots });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load slots" }, { status: 500 });
  }
}
