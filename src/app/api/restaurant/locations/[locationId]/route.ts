import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ locationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const turnoverTime =
    body.turnoverTime !== undefined ? Number(body.turnoverTime) : undefined;

  if (name !== undefined && name.length < 2) {
    return NextResponse.json(
      { error: "Name must be at least 2 characters." },
      { status: 400 }
    );
  }

  if (
    turnoverTime !== undefined &&
    (!Number.isFinite(turnoverTime) || turnoverTime < 10 || turnoverTime > 600)
  ) {
    return NextResponse.json(
      { error: "Turnover must be between 10 and 600 minutes." },
      { status: 400 }
    );
  }

  // Must be member of this location
  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.location.update({
    where: { id: locationId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(turnoverTime !== undefined ? { turnoverTime } : {}),
    },
    select: { id: true, name: true, turnoverTime: true },
  });

  return NextResponse.json({ location: updated });
}
