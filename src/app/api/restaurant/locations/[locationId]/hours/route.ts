import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

type ParamsPromise = { params: Promise<{ locationId: string }> };

const DEFAULT_OPEN = "11:00";
const DEFAULT_CLOSE = "22:00";

function normalizeTime(t: any) {
  const s = String(t || "").trim();
  // basic "HH:MM" check
  if (!/^\d{2}:\d{2}$/.test(s)) return null;
  return s;
}

export async function GET(_req: NextRequest, { params }: ParamsPromise) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = await params;

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.openingHour.findMany({
    where: { locationId },
    orderBy: { dayOfWeek: "asc" },
  });

  // If none exist yet, create defaults for 7 days
  if (existing.length === 0) {
    const created = await prisma.$transaction(
      Array.from({ length: 7 }).map((_, dayOfWeek) =>
        prisma.openingHour.create({
          data: {
            locationId,
            dayOfWeek,
            isOpen: true,
            openTime: DEFAULT_OPEN,
            closeTime: DEFAULT_CLOSE,
          },
        })
      )
    );

    return NextResponse.json({ hours: created });
  }

  // Ensure we always return 7 rows (0..6). If something missing, fill it.
  const byDay = new Map(existing.map((h) => [h.dayOfWeek, h]));
  const filled = [];
  for (let d = 0; d <= 6; d++) {
    const row = byDay.get(d);
    if (row) filled.push(row);
    else {
      const created = await prisma.openingHour.create({
        data: {
          locationId,
          dayOfWeek: d,
          isOpen: true,
          openTime: DEFAULT_OPEN,
          closeTime: DEFAULT_CLOSE,
        },
      });
      filled.push(created);
    }
  }

  return NextResponse.json({ hours: filled });
}

export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = await params;

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const hours = Array.isArray(body?.hours) ? body.hours : null;

  if (!hours) {
    return NextResponse.json({ error: "hours[] is required" }, { status: 400 });
  }

  // Validate + upsert 0..6
  const updates = [];
  for (const item of hours) {
    const dayOfWeek = Number(item?.dayOfWeek);
    if (!(dayOfWeek >= 0 && dayOfWeek <= 6)) continue;

    const isOpen = Boolean(item?.isOpen);
    const openTime = normalizeTime(item?.openTime) ?? DEFAULT_OPEN;
    const closeTime = normalizeTime(item?.closeTime) ?? DEFAULT_CLOSE;

    updates.push(
      prisma.openingHour.upsert({
        where: { locationId_dayOfWeek: { locationId, dayOfWeek } },
        create: {
          locationId,
          dayOfWeek,
          isOpen,
          openTime,
          closeTime,
        },
        update: {
          isOpen,
          openTime,
          closeTime,
        },
      })
    );
  }

  await prisma.$transaction(updates);

  const saved = await prisma.openingHour.findMany({
    where: { locationId },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ ok: true, hours: saved });
}
