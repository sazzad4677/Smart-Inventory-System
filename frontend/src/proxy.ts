import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPublicRoute =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  const sessionError = req.auth?.error;
  const isTokenExpired = sessionError === "RefreshAccessTokenError";
  const isAuthenticated = isLoggedIn && !isTokenExpired;

  console.log(
    `[Proxy] Path: ${pathname}, LoggedIn: ${isLoggedIn}, Error: ${sessionError}`,
  );

  // 1. Authenticated user on auth routes should go to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. Unauthenticated user OR expired token on a protected route -> redirect to login
  const isLandingRoute = pathname === "/";

  // 2. Unauthenticated user OR expired token on protected routes -> redirect to login
  if (!isAuthenticated && !isAuthRoute && !isPublicRoute && !isLandingRoute) {
    if (req.method === "POST") {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/" && pathname !== "/login") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
