import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // FIX: We look for "location" now, not "restaurant"
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { location: true } 
  });

  if (!membership?.location) {
    // If they have no location, return null so the frontend knows to show the setup page
    return NextResponse.json(null);
  }

  // Return the location data directly
  return NextResponse.json(membership.location);
}