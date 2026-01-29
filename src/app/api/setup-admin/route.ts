import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    const email = "admin@bookingsaas.com"; // User you want to create
    const password = "password123";        // Password for that user

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists! Go to /staff to login." });
    }

    // 2. Hash password
    const hashedPassword = await hash(password, 10);

    // 3. Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Themos Admin",
      }
    });

    return NextResponse.json({ message: "SUCCESS! Admin user created. You can now login at /staff" });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}