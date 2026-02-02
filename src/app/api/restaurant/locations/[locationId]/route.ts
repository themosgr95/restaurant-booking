import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

// PUT: Update Location Name & Turnover
export async function PUT(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const params = await props.params;
    const body = await req.json();
    const { name, turnoverTime } = body;

    const updated = await prisma.location.update({
      where: { id: params.locationId },
      data: { 
        name,
        turnoverTime: turnoverTime ? parseInt(turnoverTime) : undefined 
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: Delete a Location
export async function DELETE(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const params = await props.params;
    
    // Perform the delete
    await prisma.location.delete({
      where: { id: params.locationId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete error:", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}