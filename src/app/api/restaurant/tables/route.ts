import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// Helper to get restaurant ID from the current user
async function getRestaurantId(email: string) {
  const membership = await prisma.membership.findFirst({
    where: { user: { email } },
    select: { restaurantId: true }
  });
  return membership?.restaurantId;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurantId = await getRestaurantId(session.user.email);
    if (!restaurantId) return NextResponse.json({ error: "No restaurant found" }, { status: 404 });

    const body = await req.json();
    const { name, capacityMin, capacityMax } = body;

    const table = await prisma.table.create({
      data: {
        name,
        capacityMin: parseInt(capacityMin),
        capacityMax: parseInt(capacityMax),
        restaurantId
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}