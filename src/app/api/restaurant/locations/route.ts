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

async function requireUserEmail() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { email };
}

/**
 * GET /api/restaurant/locations
 * Returns all locations the logged-in user is a member of.
 */
export async function GET() {
  const auth = await requireUserEmail();
  if ("error" in auth) return auth.error;

  const memberships = await prisma.membership.findMany({
    where: { user: { email: auth.email } },
    include: { location: true },
    orderBy: { createdAt: "asc" },
  });

  const locations = memberships.map((m) => m.location);
  return NextResponse.json({ locations });
}

/**
 * POST /api/restaurant/locations
 * Body: { name: string, turnoverTime?: number }
 */
export async function POST(req: NextRequest) {
  const auth = await requireUserEmail();
  if ("error" in auth) return auth.error;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  const name = String(body?.name ?? "").trim();
  const turnoverTimeRaw = body?.turnoverTime;
  const turnoverTime = Number.isFinite(turnoverTimeRaw) ? Number(turnoverTimeRaw) : 90;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (turnoverTime < 5 || turnoverTime > 600) {
    return NextResponse.json({ error: "Turnover must be between 5 and 600 minutes" }, { status: 400 });
  }

  // find current user
  const user = await prisma.user.findFirst({ where: { email: auth.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // create unique slug
  const base = slugify(name) || "location";
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await prisma.location.findUnique({ where: { slug } });
    if (!existing) break;
    i += 1;
    slug = `${base}-${i}`;
  }

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

  return NextResponse.json({ location }, { status: 201 });
}

/**
 * PATCH /api/restaurant/locations
 * Body: { id: string, name?: string, turnoverTime?: number }
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireUserEmail();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const id = String(body?.id ?? "").trim();
  const name = body?.name != null ? String(body.name).trim() : undefined;
  const turnoverTime = body?.turnoverTime != null ? Number(body.turnoverTime) : undefined;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  if (turnoverTime != null && (!Number.isFinite(turnoverTime) || turnoverTime < 5 || turnoverTime > 600)) {
    return NextResponse.json({ error: "Turnover must be between 5 and 600 minutes" }, { status: 400 });
  }
  if (name != null && !name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });

  // must be member of this location
  const membership = await prisma.membership.findFirst({
    where: { locationId: id, user: { email: auth.email } },
    select: { role: true },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // If name changes, also update slug (keep unique)
  let slug: string | undefined = undefined;
  if (name != null) {
    const base = slugify(name) || "location";
    slug = base;
    let i = 1;
    while (true) {
      const existing = await prisma.location.findUnique({ where: { slug } });
      if (!existing || existing.id === id) break;
      i += 1;
      slug = `${base}-${i}`;
    }
  }

  const updated = await prisma.location.update({
    where: { id },
    data: {
      ...(name != null ? { name, slug } : {}),
      ...(turnoverTime != null ? { turnoverTime } : {}),
    },
  });

  return NextResponse.json({ location: updated });
}

/**
 * DELETE /api/restaurant/locations?id=...
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireUserEmail();
  if ("error" in auth) return auth.error;

  const id = req.nextUrl.searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const membership = await prisma.membership.findFirst({
    where: { locationId: id, user: { email: auth.email } },
    select: { role: true },
  });

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (membership.role !== "OWNER") {
    return NextResponse.json({ error: "Only OWNER can delete a location" }, { status: 403 });
  }

  await prisma.location.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
