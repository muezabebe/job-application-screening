// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

export type UserRole = "ADMIN" | "APPLICANT";

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