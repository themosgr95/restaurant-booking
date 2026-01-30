import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Simple protection (no NextAuth required):
 * - Set env var: ADMIN_API_KEY
 * - Call this endpoint with header: x-admin-key: <your key>
 *
 * If you prefer NextAuth later, we can swap this to getServerSession.
 */

export async function POST(
  req: Request,
  ctx: { params: Promise<{ locationId: string }> }
) {
  try {
    const adminKey = process.env.ADMIN_API_KEY || "";
    const providedKey = req.headers.get("x-admin-key") || "";

    if (!adminKey) {
      return NextResponse.json(
        { error: "ADMIN_API_KEY is not set on the server" },
        { status: 500 }
      );
    }

    if (providedKey !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { locationId } = await ctx.params;

    const body = await req.json().catch(() => ({}));
    const turnoverMinutes = Math.max(15, Number(body?.turnoverMinutes) || 0);

    if (!turnoverMinutes) {
      return NextResponse.json(
        { error: "turnoverMinutes is required (min 15)" },
        { status: 400 }
      );
    }

    const updated = await prisma.location.update({
      where: { id: locationId },
      data: { turnoverMinutes },
      select: { id: true, turnoverMinutes: true },
    });

    return NextResponse.json({ success: true, location: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update turnover time" },
      { status: 500 }
    );
  }
}
