import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 1. Create the Location (formerly "Restaurant")
    const location = await prisma.location.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substr(2, 4),
        // Add default turnover time
        turnoverTime: 90 
      }
    });

    // 2. Link the User to this Location (as Owner)
    await prisma.membership.create({
      data: {
        userId: user.id,
        locationId: location.id,
        role: "OWNER"
      }
    });

    return NextResponse.json({ success: true, locationId: location.id });

  } catch (error) {
    console.error("Create Location Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}