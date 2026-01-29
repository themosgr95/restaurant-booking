import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
    }

    // 1. Create the Restaurant
    // 2. Connect it to the current User as "OWNER"
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            role: "OWNER",
            user: {
              connect: { email: session.user.email },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "This slug is already taken!" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}