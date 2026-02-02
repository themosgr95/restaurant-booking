import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

type ParamsPromise = { params: { locationId: string } };

export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locationId } = params;

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const turnoverRaw = body?.turnoverMinutes ?? body?.turnoverTime ?? 90;
  const turnoverTime = Math.max(5, Number(turnoverRaw) || 90);

  await prisma.location.update({
    where: { id: locationId },
    data: { turnoverTime },
  });

  return NextResponse.json({ ok: true, turnoverTime });
}