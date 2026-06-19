import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isLandingRoute = pathname === "/";
  const isPublicRoute =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i) ||
    isLandingRoute;

  const sessionError = req.auth?.error;
  const isTokenExpired = sessionError === "RefreshAccessTokenError";
  const isAuthenticated = isLoggedIn && !isTokenExpired;

  console.log(
    `[Proxy] Path: ${pathname}, LoggedIn: ${isLoggedIn}, Error: ${sessionError}`,
  );

  // 1. Authenticated user on an auth route -> redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. Unauthenticated user OR expired token on a protected route -> redirect to login
  if (!isAuthenticated && !isAuthRoute && !isPublicRoute) {
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
