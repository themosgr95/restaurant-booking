import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.membership.findMany({
    where: { user: { email: session.user.email } },
    include: { location: true },
    orderBy: { createdAt: "asc" },
  });

  const locations = memberships.map((m) => m.location);
  return NextResponse.json({ locations });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const turnoverTime = Number(body?.turnoverTime ?? 90);

  if (!name) {
    return NextResponse.json({ error: "Name is required", field: "name" }, { status: 400 });
  }
  if (!Number.isFinite(turnoverTime) || turnoverTime < 5 || turnoverTime > 600) {
    return NextResponse.json({ error: "Turnover must be between 5 and 600 minutes", field: "turnoverTime" }, { status: 400 });
  }

  const baseSlug = slugify(name);
  if (!baseSlug) {
    return NextResponse.json({ error: "Invalid name", field: "name" }, { status: 400 });
  }

  // Ensure user exists
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Create unique slug if needed
  let slug = baseSlug;
  for (let i = 1; i <= 30; i++) {
    const exists = await prisma.location.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${baseSlug}-${i}`;
  }

  try {
    const location = await prisma.location.create({
      data: {
        name,
        slug,
        turnoverTime,
        memberships: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Auto-create weekly OpeningHour rows for this location (7 days)
    await prisma.openingHour.createMany({
      data: Array.from({ length: 7 }).map((_, dayOfWeek) => ({
        locationId: location.id,
        dayOfWeek,
        isClosed: false,
        openTime: "11:00",
        closeTime: "22:00",
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ location });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Could not create location", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
