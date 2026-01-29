import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  // IMPORTANT:
  // We are NOT enabling providers yet.
  // We'll add CredentialsProvider in the next step (staff-only login).
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
};
