import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailInput = String(credentials.email).trim().toLowerCase();

        const rawPassword = String(credentials.password);

        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: emailInput,
              mode: "insensitive",
            },
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Only active users can sign in.
        if (user.status !== UserStatus.ACTIVE) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          rawPassword,
          user.password,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],

  callbacks: {
    // Refresh user information from the database.
    async jwt({ token, user }) {
      const userId = user?.id ?? token.sub;

      if (!userId) {
        token.status = UserStatus.INACTIVE;
        return token;
      }

      const currentUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!currentUser || currentUser.status !== UserStatus.ACTIVE) {
        token.status = UserStatus.INACTIVE;
        return token;
      }

      token.sub = currentUser.id;
      token.role = currentUser.role;
      token.status = currentUser.status;

      return token;
    },

    // Return a valid Session object.
    async session({ session, token }) {
      if (!session.user || !token.sub) {
        return session;
      }

      session.user.id = token.sub;

      session.user.role =
        token.role === UserRole.ADMIN || token.role === UserRole.APPLICANT
          ? token.role
          : UserRole.APPLICANT;

      session.user.status =
        token.status === UserStatus.ACTIVE ||
        token.status === UserStatus.INACTIVE
          ? token.status
          : UserStatus.INACTIVE;

      return session;
    },
  },
});
