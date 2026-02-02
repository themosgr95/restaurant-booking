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

  // Return special rules (closures + special hours) for this location
  const rules = await prisma.specialRule.findMany({
    where: { locationId },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      openTime: true,
      closeTime: true,
      note: true,
    },
  });

  // Send as strings to avoid Date serialization surprises in the UI
  return NextResponse.json({
    rules: rules.map((r) => ({
      id: r.id,
      type: r.type,
      startDate: r.startDate.toISOString().slice(0, 10),
      endDate: r.endDate.toISOString().slice(0, 10),
      openTime: r.openTime ?? null,
      closeTime: r.closeTime ?? null,
      note: r.note ?? null,
    })),
  });
}
