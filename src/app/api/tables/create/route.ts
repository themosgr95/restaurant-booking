import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, capacity, locationId } = body;

    if (!name || !capacity || !locationId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Verify the user actually owns/works at this location
    const membership = await prisma.membership.findFirst({
      where: {
        locationId: locationId,
        user: { email: session.user.email },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "You do not have permission for this location" }, { status: 403 });
    }

    // 2. Create the Table
    const table = await prisma.table.create({
      data: {
        name,
        capacity: parseInt(capacity), // Ensure it's a number
        locationId,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error("Failed to create table:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}