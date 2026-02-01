import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// expects "YYYY-MM-DD"
function asDateOnly(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

type ParamsPromise = { params: Promise<{ locationId: string }> };

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

  const rules = await prisma.specialRule.findMany({
    where: { locationId },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({
    rules: rules.map((r) => ({
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

export async function POST(req: NextRequest, { params }: ParamsPromise) {
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

  const type = body?.type; // "CLOSED" | "SPECIAL_HOURS"
  const startDate = body?.startDate; // "YYYY-MM-DD"
  const endDate = body?.endDate; // "YYYY-MM-DD"

  if (!type || !startDate || !endDate) {
    return NextResponse.json(
      { error: "type, startDate, endDate are required" },
      { status: 400 }
    );
  }

  if (type === "SPECIAL_HOURS" && (!body?.openTime || !body?.closeTime)) {
    return NextResponse.json(
      { error: "openTime and closeTime are required for SPECIAL_HOURS" },
      { status: 400 }
    );
  }

  const rule = await prisma.specialRule.create({
    data: {
      locationId,
      type,
      startDate: asDateOnly(startDate),
      endDate: asDateOnly(endDate),
      openTime: body?.openTime ?? null,
      closeTime: body?.closeTime ?? null,
      note: body?.note ?? null,
    },
  });

  return NextResponse.json({ id: rule.id });
}

export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
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

  const url = new URL(req.url);
  const ruleId = url.searchParams.get("ruleId");

  if (!ruleId) {
    return NextResponse.json({ error: "ruleId is required" }, { status: 400 });
  }

  await prisma.specialRule.delete({
    where: { id: ruleId },
  });

  return NextResponse.json({ ok: true });
}
