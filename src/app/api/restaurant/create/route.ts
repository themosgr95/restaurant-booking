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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate a simple slug from the name (e.g., "My Restaurant" -> "my-restaurant")
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    // 1. Get the User ID from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Create Location AND Membership in one transaction
    const location = await prisma.location.create({
      data: {
        name,
        slug,
        description: description || "",
        memberships: {  // <--- FIXED: Changed from 'members' to 'memberships'
          create: {
            userId: user.id,
            role: "OWNER", // You become the owner immediately
          },
        },
      },
    });

    return NextResponse.json({ success: true, location });
  } catch (error) {
    console.error("Failed to create location:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}