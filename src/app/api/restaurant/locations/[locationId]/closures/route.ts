import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { location: true },
    orderBy: { createdAt: "desc" },
  });

  const locations = memberships.map((m) => m.location);
  return NextResponse.json({ locations });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const turnoverTime = Number(body?.turnoverTime ?? 60);

  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required (min 2 chars)." }, { status: 400 });
  }
  if (!Number.isFinite(turnoverTime) || turnoverTime < 10 || turnoverTime > 600) {
    return NextResponse.json({ error: "Turnover must be between 10 and 600 minutes." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const baseSlug = slugify(name) || "location";
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

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
      select: { id: true, name: true, slug: true, turnoverTime: true },
    });

    return NextResponse.json({ location });
  } catch (e: any) {
    // Common: unique slug conflict (very rare with random suffix)
    return NextResponse.json({ error: "Could not create location." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Must be a member of this location
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, locationId: id },
    select: { role: true },
  });

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // optional: only OWNER can delete
  if (membership.role !== "OWNER") {
    return NextResponse.json({ error: "Only OWNER can delete locations." }, { status: 403 });
  }

  try {
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete location." }, { status: 500 });
  }
}
