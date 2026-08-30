// app/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@/types/next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Recruiters will be sent here when accessing /admin
  },
  providers: [], // We will attach Credentials provider in auth.ts
  callbacks: {
    authorized({ auth }) {
      return true; // Middleware handles direct route guarding
    },
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as UserRole) ?? "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;