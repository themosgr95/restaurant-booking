import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

type Ctx = { params: Promise<{ locationId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = await ctx.params;

  // Must be a member of this location
  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get weekly hours for this location
  const hours = await prisma.openingHour.findMany({
    where: { locationId },
    orderBy: { dayOfWeek: "asc" },
    select: {
      id: true,
      locationId: true,
      dayOfWeek: true,
      openTime: true,
      closeTime: true,
      isClosed: true,
    },
  });

  return NextResponse.json({ hours });
}
