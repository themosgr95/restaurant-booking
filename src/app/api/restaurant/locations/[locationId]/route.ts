import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PATCH(
  req: NextRequest,
  ctx: { params: { locationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = ctx.params;

  // must be member
  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({} as any));

  const data: { name?: string; turnoverTime?: number } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }
    data.name = name;
  }

  if (body.turnoverTime !== undefined) {
    const t = Number(body.turnoverTime);
    if (!Number.isFinite(t) || t < 10 || t > 600) {
      return NextResponse.json({ error: "Turnover must be between 10 and 600 minutes." }, { status: 400 });
    }
    data.turnoverTime = t;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.location.update({
    where: { id: locationId },
    data,
    select: { id: true, name: true, turnoverTime: true },
  });

  return NextResponse.json({ location: updated });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: { locationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = ctx.params;

  // must be member
  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete location (cascade should remove tables/bookings/hours/rules if your schema uses onDelete: Cascade)
  await prisma.location.delete({
    where: { id: locationId },
  });

  return NextResponse.json({ success: true });
}
