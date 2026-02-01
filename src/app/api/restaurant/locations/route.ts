import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Current setup: membership links to ONE location.
  // The UI expects a list, so we wrap it into { locations: [...] }.
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { location: true },
  });

  if (!membership?.location) {
    // Always return a list (empty)
    return NextResponse.json({ locations: [] });
  }

  return NextResponse.json({ locations: [membership.location] });
}
