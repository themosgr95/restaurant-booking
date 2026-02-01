import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

async function ensureUniqueSlug(base: string) {
  let slug = base || `location-${randomSuffix()}`;
  // try a few times
  for (let i = 0; i < 8; i++) {
    const exists = await prisma.location.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${randomSuffix()}`;
  }
  // last resort
  return `${base}-${Date.now()}`;
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.membership.findMany({
    where: { user: { email: session.user.email } },
    include: { location: true },
    orderBy: { createdAt: "asc" },
  });

  const locations = memberships.map((m) => ({
    id: m.location.id,
    name: m.location.name,
    slug: m.location.slug,
    turnoverTime: m.location.turnoverTime,
  }));

  return NextResponse.json({ locations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").toString().trim();

  // accept either turnoverMinutes or turnoverTime from the UI
  const turnoverRaw = body?.turnoverMinutes ?? body?.turnoverTime ?? 90;
  const turnoverTime = Math.max(5, Number(turnoverRaw) || 90);

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const baseSlug = slugify(name);
  const slug = await ensureUniqueSlug(baseSlug);

  // create location
  const location = await prisma.location.create({
    data: {
      name,
      slug,
      turnoverTime, // ✅ Prisma field name
    },
  });

  // add membership for creator (OWNER)
  const user = await prisma.user.findFirst({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (user) {
    await prisma.membership.create({
      data: {
        userId: user.id,
        locationId: location.id,
        role: "OWNER",
      },
    });
  }

  return NextResponse.json({
    id: location.id,
    name: location.name,
    slug: location.slug,
    turnoverTime: location.turnoverTime,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }

  // only OWNER can delete
  const membership = await prisma.membership.findFirst({
    where: {
      locationId,
      user: { email: session.user.email },
      role: "OWNER",
    },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.location.delete({
    where: { id: locationId },
  });

  return NextResponse.json({ ok: true });
}
