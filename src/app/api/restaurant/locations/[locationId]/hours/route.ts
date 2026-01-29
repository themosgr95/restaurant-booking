import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { locationId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { hours } = body; // Expects an array of opening hours

    // 1. Delete all existing hours for this location (Reset)
    await prisma.openingHour.deleteMany({
      where: { locationId: params.locationId }
    });

    // 2. Insert the new schedule
    if (hours && hours.length > 0) {
      await prisma.openingHour.createMany({
        data: hours.map((h: any) => ({
          locationId: params.locationId,
          dayOfWeek: h.dayOfWeek,
          opensAt: h.opensAt,
          closesAt: h.closesAt
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update hours" }, { status: 500 });
  }
}