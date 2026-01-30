import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

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
    const guests = Math.max(1, Number(searchParams.get("guests") ?? "0") || 0);
    const month = searchParams.get("month") ?? ""; // YYYY-MM

    if (!locationId || !guests || !month) {
      return NextResponse.json(
        { error: "Missing required params: locationId, guests, month" },
        { status: 400 }
      );
    }

    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const mon = Number(monthStr);

    if (!year || !mon || mon < 1 || mon > 12) {
      return NextResponse.json({ error: "Invalid month param" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { turnoverMinutes: true },
    });
    if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });

    const turnoverMinutes = Math.max(15, Number(location.turnoverMinutes) || 120);

    // Preload tables once
    const tables = await prisma.table.findMany({
      where: { locationId, capacity: { gte: guests } },
      select: { id: true },
    });

    // If no table can fit, everything is unavailable
    if (tables.length === 0) {
      return NextResponse.json({ availableDates: [], closedDates: [] });
    }

    const daysInMonth = new Date(year, mon, 0).getDate();

    // Preload opening hours + special closures for this month
    const hours = await prisma.openingHour.findMany({
      where: { locationId },
      select: { dayOfWeek: true, opensAt: true, closesAt: true },
    });

    const specialClosures = await prisma.specialClosure.findMany({
      where: {
        locationId,
        date: { gte: `${year}-${pad2(mon)}-01`, lte: `${year}-${pad2(mon)}-${pad2(daysInMonth)}` },
      },
      select: { date: true, isClosed: true, opensAt: true, closesAt: true },
    });

    const specialByDate = new Map(specialClosures.map((s) => [s.date, s]));

    const availableDates: string[] = [];
    const closedDates: string[] = [];

    // helper to decide if a day has at least 1 slot with at least 1 free table
    async function hasAnySlot(dateStr: string, opensAt: string, closesAt: string) {
      const openDt = new Date(`${dateStr}T${opensAt}:00`);
      const closeDt = new Date(`${dateStr}T${closesAt}:00`);

      // last start must allow full turnover inside closing time
      const lastStart = addMinutes(closeDt, -turnoverMinutes);
      if (lastStart <= openDt) return false;

      const bookings = await prisma.booking.findMany({
        where: { locationId, date: dateStr, status: { in: ["CONFIRMED", "PENDING"] } },
        select: { tableId: true, time: true, turnoverMinutes: true },
      });

      // build intervals per table
      const intervalsByTable = new Map<string, Array<{ start: Date; end: Date }>>();
      for (const b of bookings) {
        const bTurn = Math.max(15, Number(b.turnoverMinutes) || turnoverMinutes);
        const bStart = new Date(`${dateStr}T${b.time}:00`);
        const bEnd = addMinutes(bStart, bTurn);
        const arr = intervalsByTable.get(b.tableId) ?? [];
        arr.push({ start: bStart, end: bEnd });
        intervalsByTable.set(b.tableId, arr);
      }

      // generate slots every 15 minutes
      for (let t = new Date(openDt); t <= lastStart; t = addMinutes(t, 15)) {
        const slotStart = t;
        const slotEnd = addMinutes(slotStart, turnoverMinutes);

        // if any table is free at this slot, the day is available
        let anyFree = false;

        for (const table of tables) {
          const intervals = intervalsByTable.get(table.id) ?? [];
          const conflict = intervals.some((iv) => overlaps(slotStart, slotEnd, iv.start, iv.end));
          if (!conflict) {
            anyFree = true;
            break;
          }
        }

        if (anyFree) return true;
      }

      return false;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${pad2(mon)}-${pad2(day)}`;

      const special = specialByDate.get(dateStr);
      if (special?.isClosed) {
        closedDates.push(dateStr);
        continue;
      }

      const dow = new Date(`${dateStr}T00:00:00`).getDay();
      const normal = hours.find((h) => h.dayOfWeek === dow);

      const opensAt = (special?.opensAt ?? normal?.opensAt) || null;
      const closesAt = (special?.closesAt ?? normal?.closesAt) || null;

      if (!opensAt || !closesAt) {
        closedDates.push(dateStr);
        continue;
      }

      const ok = await hasAnySlot(dateStr, opensAt, closesAt);
      if (ok) availableDates.push(dateStr);
    }

    return NextResponse.json({ availableDates, closedDates });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load availability dates" }, { status: 500 });
  }
}
