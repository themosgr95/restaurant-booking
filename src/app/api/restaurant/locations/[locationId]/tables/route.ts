import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, capacity } = body;

    if (!name || !capacity) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const table = await prisma.table.create({
      data: {
        name,
        capacity,
        locationId: params.locationId
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}

// Optional: DELETE table
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID Missing" }, { status: 400 });

        await prisma.table.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}