// middleware.ts
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/app/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  // 1. Guard /admin routes (ADMIN role only)
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 2. Protect job submission (/jobs/[id]) and applicant dashboard (/dashboard)
  // Note: Root /jobs remains publicly accessible
  const isProtectedJobRoute = pathname.startsWith("/jobs/") && pathname !== "/jobs";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if ((isProtectedJobRoute || isDashboardRoute) && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  // 3. Prevent logged-in users from accessing /login or /register
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    const destination = userRole === "ADMIN" ? "/admin/applications" : "/dashboard";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Negative lookahead matches page routes while bypassing /api, static files, and assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};