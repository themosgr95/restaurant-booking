import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Return only locations where the logged-in user is a member
    const memberships = await prisma.membership.findMany({
      where: { user: { email: session.user.email } },
      select: {
        location: {
          select: { id: true, name: true, turnoverTime: true },
        },
      },
      orderBy: { createdAt: "desc" as any }, // if createdAt doesn't exist, Prisma will complain at dev-time
    });

    const locations = memberships.map((m) => m.location);
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json({ error: "Could not load locations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const turnoverTime = Number(body?.turnoverTime ?? 60);

  if (name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
  }

  if (!Number.isFinite(turnoverTime) || turnoverTime < 10 || turnoverTime > 600) {
    return NextResponse.json({ error: "Turnover must be between 10 and 600." }, { status: 400 });
  }

  try {
    const email = session.user.email;

    // Ensure user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const base = slugify(name);
    const slug = `${base}-${Date.now().toString(36)}`;

    // Create location + membership so you can manage it immediately
    const created = await prisma.$transaction(async (tx) => {
      const location = await tx.location.create({
        data: {
          name,
          slug,
          turnoverTime,
        },
        select: { id: true, name: true, turnoverTime: true },
      });

      // membership model may have extra fields; this is the safest "connect" style
      await tx.membership.create({
        data: {
          user: { connect: { id: user.id } },
          location: { connect: { id: location.id } },
        } as any,
      });

      return location;
    });

    return NextResponse.json({ location: created });
  } catch {
    return NextResponse.json({ error: "Could not create location." }, { status: 500 });
  }
}

// ❌ DO NOT export PATCH here.
// PATCH belongs ONLY in: /api/restaurant/locations/[locationId]/route.ts
