import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ locationId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { locationId } = await ctx.params;
    const body = await req.json();
    const turnoverMinutes = Math.max(15, Number(body?.turnoverMinutes) || 0);

    if (!turnoverMinutes) {
      return NextResponse.json({ error: "turnoverMinutes is required (min 15)" }, { status: 400 });
    }

    await prisma.location.update({
      where: { id: locationId },
      data: { turnoverMinutes },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update turnover time" }, { status: 500 });
  }
}
