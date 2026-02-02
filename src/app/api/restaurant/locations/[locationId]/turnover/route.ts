import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// PUT: Update turnover time
export async function PUT(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  try {
    // FIX: Await the params object
    const params = await props.params;
    const { locationId } = params;

    const body = await req.json();
    const { turnoverTime } = body;

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: { turnoverTime: parseInt(turnoverTime) },
    });

    return NextResponse.json({ ok: true, turnoverTime: updatedLocation.turnoverTime });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update turnover" }, { status: 500 });
  }
}