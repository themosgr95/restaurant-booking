import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  // FIX 1: Type 'params' as a Promise
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // FIX 2: Await the params before using the ID
    const { locationId } = await params;

    const body = await req.json();
    
    // Ensure turnoverTime is valid (minimum 15 mins, default 90)
    const turnoverTime = Math.max(15, Number(body.turnoverTime) || 90);

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: { turnoverTime }
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update turnover time" }, { status: 500 });
  }
}