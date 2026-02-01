import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

function toDateOnly(d: Date) {
  // normalize to date-only comparison
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId");
  const dateStr = url.searchParams.get("date"); // expected: YYYY-MM-DD

  if (!locationId || !dateStr) {
    return NextResponse.json(
      { error: "locationId and date are required" },
      { status: 400 }
    );
  }

  // Safety: user must be member of location
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email }, locationId },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const date = toDateOnly(new Date(`${dateStr}T00:00:00.000Z`));

  // 1) Bookings count for that day
  const bookingsCount = await prisma.booking.count({
    where: {
      locationId,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  // 2) Guests count for that day
  const bookings = await prisma.booking.findMany({
    where: {
      locationId,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: { guests: true },
  });

  const guestsCount = bookings.reduce((sum, b) => sum + (b.guests ?? 0), 0);

  // 3) ✅ Special rules that affect this day (Closed or Special Hours)
  // We fetch any rule where startDate <= date <= endDate
  const specialRules = await prisma.specialRule.findMany({
    where: {
      locationId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({
    bookingsCount,
    guestsCount,
    specialRules: specialRules.map((r) => ({
      id: r.id,
      type: r.type, // CLOSED | SPECIAL_HOURS
      startDate: r.startDate.toISOString().slice(0, 10),
      endDate: r.endDate.toISOString().slice(0, 10),
      openTime: r.openTime ?? null,
      closeTime: r.closeTime ?? null,
      note: r.note ?? null,
    })),
  });
}
