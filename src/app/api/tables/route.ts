import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

// GET: Fetch all tables
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) return NextResponse.json({ error: "Location ID required" }, { status: 400 });

  const tables = await prisma.table.findMany({
    where: { locationId },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ tables });
}

// POST: Create a table
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, capacity, locationId } = body; // <--- No shape here

    const table = await prisma.table.create({
      data: {
        name,
        capacity: parseInt(capacity),
        locationId,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}

// PUT: Update a table
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, name, capacity } = body; // <--- No shape here

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name,
        capacity: parseInt(capacity),
      },
    });

    return NextResponse.json({ success: true, table: updatedTable });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}

// DELETE: Remove a table
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get("id");

  await prisma.table.delete({ where: { id: tableId! } });
  return NextResponse.json({ success: true });
}