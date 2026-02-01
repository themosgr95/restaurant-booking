import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

type ParamsPromise = { params: Promise<{ locationId: string }> };

function isISODate(s: any) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function isTime(s: any) {
  return typeof s === "string" && /^\d{2}:\d{2}$/.test(s);
}

export async function GET(_req: NextRequest, { params }: ParamsPromise) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { locationId } = await params;

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rules = await prisma.specialRule.findMany({
    where: { locationId },
    orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
  });

  // Return as YYYY-MM-DD strings for the UI
  return NextResponse.json({
    rules: rules.map((r) => ({
      id: r.id,
      type: r.type,
      startDate: r.startDate.toISOString().slice(0, 10),
      endDate: r.endDate.toISOString().slice(0, 10),
      openTime: r.openTime,
      closeTime: r.closeTime,
      note: r.note,
    })),
  });
}

export async function POST(req: NextRequest, { params }: ParamsPromise) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { locationId } = await params;

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);

  const type = body?.type as "CLOSED" | "SPECIAL_HOURS";
  const startDate = body?.startDate;
  const endDate = body?.endDate;
  const openTime = body?.openTime ?? null;
  const closeTime = body?.closeTime ?? null;
  const note = body?.note ?? null;

  const fieldErrors: Record<string, string> = {};

  if (type !== "CLOSED" && type !== "SPECIAL_HOURS") fieldErrors.type = "Pick a valid type.";
  if (!isISODate(startDate)) fieldErrors.startDate = "Pick a valid start date.";
  if (!isISODate(endDate)) fieldErrors.endDate = "Pick a valid end date.";

  if (isISODate(startDate) && isISODate(endDate) && startDate > endDate) {
    fieldErrors.endDate = "End date must be after start date.";
  }

  if (type === "SPECIAL_HOURS") {
    if (!isTime(openTime)) fieldErrors.openTime = "Pick a valid open time.";
    if (!isTime(closeTime)) fieldErrors.closeTime = "Pick a valid close time.";
    if (isTime(openTime) && isTime(closeTime) && openTime >= closeTime) {
      fieldErrors.closeTime = "Close time must be after open time.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Validation error", fieldErrors }, { status: 400 });
  }

  const created = await prisma.specialRule.create({
    data: {
      locationId,
      type,
      startDate: new Date(`${startDate}T00:00:00.000Z`),
      endDate: new Date(`${endDate}T00:00:00.000Z`),
      openTime: type === "SPECIAL_HOURS" ? openTime : null,
      closeTime: type === "SPECIAL_HOURS" ? closeTime : null,
      note,
    },
  });

  return NextResponse.json({
    id: created.id,
    type: created.type,
    startDate,
    endDate,
    openTime: created.openTime,
    closeTime: created.closeTime,
    note: created.note,
  });
}

export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { locationId } = await params;

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const ruleId = url.searchParams.get("ruleId");
  if (!ruleId) return NextResponse.json({ error: "ruleId is required" }, { status: 400 });

  await prisma.specialRule.delete({
    where: { id: ruleId },
  });

  return NextResponse.json({ ok: true });
}
