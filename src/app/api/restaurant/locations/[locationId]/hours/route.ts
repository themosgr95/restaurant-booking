import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(
  _req: NextRequest,
  ctx: { params: { locationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = ctx.params;

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hours = await prisma.openingHour.findMany({
    where: { locationId },
    orderBy: { dayOfWeek: "asc" },
    select: {
      id: true,
      locationId: true,
      dayOfWeek: true,
      isClosed: true,
      openTime: true,
      closeTime: true,
    },
  });

  return NextResponse.json({ hours });
}