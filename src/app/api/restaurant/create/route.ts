import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // 1. Create the Restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substr(2, 4),
        // 2. Link the User as the OWNER immediately
        memberships: {
          create: {
            user: { connect: { email: session.user.email } },
            role: "OWNER"
          }
        },
        // 3. Create a Default Location so the dashboard isn't empty
        locations: {
          create: { name: "Main Room" }
        }
      }
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Create Restaurant Error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}