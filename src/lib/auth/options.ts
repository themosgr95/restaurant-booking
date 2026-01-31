import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Point to your custom login page
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', 
  },
  
  session: {
    strategy: 'jwt'
  },
  
  providers: [
    // 1. Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // 2. Apple Login
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
    
    // 3. Email/Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Check if inputs exist
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // 2. Find user in DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // 3. If no user found, return null
        if (!user) {
          return null;
        }

        // 4. Verify Password
        // FIX: We use 'user.password' here (not passwordHash)
        // We add '|| ""' to prevent errors if the user has no password (e.g. Google-only account)
        const isPasswordValid = await compare(credentials.password, user.password || "");

        if (!isPasswordValid) {
          return null;
        }

        // 5. Return User Data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],

  callbacks: {
    async session({ session, token }) {
      // Pass ID and Role to the frontend session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        }
      }
    },
    async jwt({ token, user }) {
      // Initial sign in: Add ID and Role to the token
      if (user) {
        token.id = user.id;
        // @ts-ignore: 'role' is not on standard User type, but we added it in Prisma
        token.role = user.role;
      }
      return token;
    }
  }
};