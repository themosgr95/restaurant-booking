import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt" // Required for Credentials/Password login
  },
  pages: {
    signIn: "/staff", // Redirects here if not logged in
  },
  providers: [
    CredentialsProvider({
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 2. If no user or no password set, fail
        if (!user || !user.password) {
          return null; 
        }

        // 3. Check if password matches
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // 4. Return user info on success
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
};