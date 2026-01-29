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

// 1. CREATE Table
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

// 2. DELETE Table
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurantId = await getRestaurantId(session.user.email);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !restaurantId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // Use deleteMany to ensure we only delete if it belongs to THIS restaurant (Security)
    await prisma.table.deleteMany({
      where: {
        id: id,
        restaurantId: restaurantId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// 3. UPDATE Table
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurantId = await getRestaurantId(session.user.email);
    const body = await req.json();
    const { id, name, capacityMin, capacityMax } = body;

    if (!id || !restaurantId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // Ensure ownership before update
    const count = await prisma.table.count({ where: { id, restaurantId }});
    if (count === 0) return NextResponse.json({ error: "Table not found" }, { status: 404 });

    const table = await prisma.table.update({
      where: { id },
      data: {
        name,
        capacityMin: parseInt(capacityMin),
        capacityMax: parseInt(capacityMax),
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}