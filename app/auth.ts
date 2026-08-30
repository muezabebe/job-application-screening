// app/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// 1. Extend NextAuth type definitions to recognize 'role'
declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      role?: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [Auth]: Missing email or password input");
          return null;
        }

        const emailInput = (credentials.email as string).trim().toLowerCase();
        const rawPassword = credentials.password as string;

        // 1. Fetch user from database with normalized lower-case email or insensitive match
        let user = await prisma.user.findUnique({
          where: { email: emailInput },
        });

        // Fallback search if standard look-up fails (e.g., case sensitivity mismatch in DB)
        if (!user) {
          user = await prisma.user.findFirst({
            where: {
              email: {
                equals: emailInput,
                mode: "insensitive",
              },
            },
          });
        }

        if (!user) {
          console.log(`❌ [Auth]: No user account found for email: "${emailInput}"`);
          return null;
        }

        if (!user.password) {
          console.log(`❌ [Auth]: User "${emailInput}" has no password set (OAuth account)`);
          return null;
        }

        // 2. Verify hashed password securely using bcrypt
        const isValidPassword = await bcrypt.compare(rawPassword, user.password);
        if (!isValidPassword) {
          console.log(`❌ [Auth]: Invalid password attempt for email: "${emailInput}"`);
          return null;
        }

        console.log(`✅ [Auth]: Authentication successful for "${user.email}" (Role: ${user.role})`);

        // 3. Return user object to populate JWT token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // 4. Transfer role and ID from user object to JWT on initial login
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    // 5. Transfer role and ID from JWT token into the client/server session object
    async session({ session, token }) {
      if (session.user) {
        if (token.role) session.user.role = token.role as UserRole;
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
});