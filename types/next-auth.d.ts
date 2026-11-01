import { DefaultSession } from "next-auth";
import { UserRole, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role?: UserRole;
    status?: UserStatus;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    status?: UserStatus;
  }
}