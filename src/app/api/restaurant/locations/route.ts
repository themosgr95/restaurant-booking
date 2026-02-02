import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const membership = await prisma.membership.findFirst({
    where: { locationId: id, user: { email: session.user.email } },
    select: { role: true },
  });

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Optional: only OWNER can delete
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
