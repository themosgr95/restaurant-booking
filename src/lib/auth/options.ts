import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', 
  },
  
  session: {
    strategy: 'jwt'
  },
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        const isPasswordValid = await compare(credentials.password, user.password || "");

        if (!isPasswordValid) return null;

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
    // 1. Handle Auto-Registration for Google/Apple
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "apple") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
             where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user if they don't exist
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "New User",
                image: user.image,
                role: "STAFF", // Default role
              }
            });
          }
          return true;
        } catch (error) {
          console.log("OAuth Creation Error", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      // Ensure we fetch the latest role from DB or Token
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        }
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
      }
      
      // OPTIONAL: Reload role from DB on every request to ensure accuracy
      // This is useful if you manually change a user's role in the DB
      if (!token.role && token.email) {
         const dbUser = await prisma.user.findUnique({ where: { email: token.email }});
         if (dbUser) token.role = dbUser.role;
      }

      return token;
    }
  }
};