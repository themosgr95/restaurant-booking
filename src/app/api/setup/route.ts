import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  // 1. Get the real user from DB to ensure we have the ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 2. Create the Location
  const location = await prisma.location.create({
    data: {
      name: name,
      slug: name.toLowerCase().replace(/ /g, "-") + "-" + Math.floor(Math.random() * 1000),
      turnoverTime: 90
    }
  });

  // 3. Link User to Location
  await prisma.membership.create({
    data: {
      userId: user.id, // <--- Now we use the ID from the database user
      locationId: location.id,
      role: "OWNER"
    }
  });

  return NextResponse.json({ success: true });
}