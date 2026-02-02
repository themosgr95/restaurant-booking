import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// GET: Fetch tables for a specific location
export async function GET(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  // FIX: Await params
  const params = await props.params;
  const { locationId } = params;

  const tables = await prisma.table.findMany({
    where: { locationId },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(tables);
}

// POST: Create a table in this location
export async function POST(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FIX: Await params
  const params = await props.params;
  const { locationId } = params;
  
  try {
    const body = await req.json();
    const { name, capacity } = body;

    const table = await prisma.table.create({
      data: {
        name,
        capacity: parseInt(capacity),
        locationId
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}