import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// 1. CREATE (POST) - Already existed, keeping it
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name } = body;

    const membership = await prisma.membership.findFirst({
      where: { user: { email: session.user.email } },
      include: { restaurant: true }
    });

    if (!membership?.restaurant) return NextResponse.json({ error: "No restaurant found" }, { status: 400 });

    const location = await prisma.location.create({
      data: {
        name,
        restaurantId: membership.restaurant.id,
        slug: name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substr(2, 4)
      }
    });

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// 2. DELETE (New!)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Verify ownership before deleting
    const membership = await prisma.membership.findFirst({
      where: { user: { email: session.user.email } },
      include: { restaurant: { include: { locations: true } } }
    });

    const ownsLocation = membership?.restaurant?.locations.some(l => l.id === id);
    if (!ownsLocation) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.location.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// 3. UPDATE (PATCH) - New!
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name } = body;

    // Verify ownership
    const membership = await prisma.membership.findFirst({
      where: { user: { email: session.user.email } },
      include: { restaurant: { include: { locations: true } } }
    });

    const ownsLocation = membership?.restaurant?.locations.some(l => l.id === id);
    if (!ownsLocation) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.location.update({
      where: { id },
      data: { name }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}