import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// FIX: Type the params as a Promise
export async function GET(
  req: Request,
  props: { params: Promise<{ locationId: string }> }
) {
  // FIX: Await the params before using them
  const params = await props.params;
  const { locationId } = params;

  const hours = await prisma.openingHour.findMany({
    where: { locationId },
    orderBy: { dayOfWeek: 'asc' }
  });

  return NextResponse.json({ hours });
}