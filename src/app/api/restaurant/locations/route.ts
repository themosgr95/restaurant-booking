import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// Helper to get restaurant ID
async function getRestaurantId(email: string) {
  const membership = await prisma.membership.findFirst({
    where: { user: { email } },
    select: { restaurantId: true }
  });
  return membership?.restaurantId;
}

// GET: List all locations
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurantId = await getRestaurantId(session.user.email);
    if (!restaurantId) return NextResponse.json({ error: "No restaurant found" }, { status: 404 });

    const locations = await prisma.location.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

// POST: Create a new location
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurantId = await getRestaurantId(session.user.email);
    if (!restaurantId) return NextResponse.json({ error: "No restaurant found" }, { status: 404 });

    const body = await req.json();
    const { name } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const location = await prisma.location.create({
      data: {
        name,
        restaurantId
      }
    });

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}