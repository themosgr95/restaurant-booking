import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();

    const membership = await prisma.membership.findFirst({
      where: { user: { email: session.user.email } },
      include: { restaurant: true }
    });

    if (!membership?.restaurant) return NextResponse.json({ error: "No restaurant" }, { status: 400 });

    const location = await prisma.location.create({
      data: {
        name,
        restaurantId: membership.restaurant.id,
      }
    });

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, turnoverTime } = await req.json();

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: { turnoverTime: parseInt(turnoverTime) }
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}