import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

// GET: Fetch all tables for a specific location
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "Location ID required" }, { status: 400 });
  }

  const tables = await prisma.table.findMany({
    where: { locationId },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ tables });
}

// DELETE: Remove a table
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get("id");

  if (!tableId) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.table.delete({
    where: { id: tableId },
  });

  return NextResponse.json({ success: true });
}