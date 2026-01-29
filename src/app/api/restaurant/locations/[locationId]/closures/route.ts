import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// DELETE remains the same (it handles ID via URL search params)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.specialClosure.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

// FIX: Update POST to treat params as a Promise
export async function POST(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  try {
    const params = await props.params; // <--- AWAITING PARAMS HERE
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { date, note } = body;

    await prisma.specialClosure.create({
      data: {
        locationId: params.locationId,
        date: new Date(date),
        isClosed: true,
        note
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create closure" }, { status: 500 });
  }
}