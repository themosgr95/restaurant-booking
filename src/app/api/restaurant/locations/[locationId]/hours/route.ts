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

  if (existing.length === 0) {
    await prisma.openingHour.createMany({
      data: Array.from({ length: 7 }).map((_, dayOfWeek) => ({
        locationId,
        dayOfWeek,
        isOpen: true,
        openTime: DEFAULT_OPEN,
        closeTime: DEFAULT_CLOSE,
      })),
    });

    const created = await prisma.openingHour.findMany({
      where: { locationId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ hours: created });
  }

  // ensure 7 rows
  const byDay = new Map(existing.map((h) => [h.dayOfWeek, h]));
  for (let d = 0; d <= 6; d++) {
    if (!byDay.get(d)) {
      await prisma.openingHour.create({
        data: {
          locationId,
          dayOfWeek: d,
          isOpen: true,
          openTime: DEFAULT_OPEN,
          closeTime: DEFAULT_CLOSE,
        },
      });
    }
  }

  const filled = await prisma.openingHour.findMany({
    where: { locationId },
    orderBy: { dayOfWeek: "asc" },
  });

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
    return NextResponse.json(
      { error: "Validation error", fieldErrors: { hours: "hours[] is required" } },
      { status: 400 }
    );
  }

  const fieldErrors: Record<string, string> = {};

  for (const item of hours) {
    const dayOfWeek = Number(item?.dayOfWeek);
    if (!(dayOfWeek >= 0 && dayOfWeek <= 6)) continue;

    const isOpen = Boolean(item?.isOpen);
    const openTime = normalizeTime(item?.openTime) ?? DEFAULT_OPEN;
    const closeTime = normalizeTime(item?.closeTime) ?? DEFAULT_CLOSE;

    if (isOpen && openTime >= closeTime) {
      fieldErrors[`day_${dayOfWeek}`] = "Open time must be earlier than close time.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Validation error", fieldErrors }, { status: 400 });
  }

  // upsert per day
  for (const item of hours) {
    const dayOfWeek = Number(item?.dayOfWeek);
    if (!(dayOfWeek >= 0 && dayOfWeek <= 6)) continue;

    const isOpen = Boolean(item?.isOpen);
    const openTime = normalizeTime(item?.openTime) ?? DEFAULT_OPEN;
    const closeTime = normalizeTime(item?.closeTime) ?? DEFAULT_CLOSE;

    await prisma.openingHour.upsert({
      where: { locationId_dayOfWeek: { locationId, dayOfWeek } },
      create: { locationId, dayOfWeek, isOpen, openTime, closeTime },
      update: { isOpen, openTime, closeTime },
    });
  }

  const saved = await prisma.openingHour.findMany({
    where: { locationId },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ ok: true, hours: saved });
}
