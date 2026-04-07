import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route guard middleware.
 *
 * Checks for the httpOnly `refreshToken` cookie (long-lived, 7d).
 * If present → user has an active session → allow access.
 * If absent  → user is unauthenticated → redirect to /login.
 *
 * NOTE: The accessToken (15m) may be expired between refreshes, but the
 * refreshToken's presence is sufficient for route guarding. The actual
 * token refresh happens inside apiFetch on 401.
 */
export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  // Not authenticated → redirect to login
  if (!refreshToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated → skip auth pages
  if (refreshToken && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Root redirect
  if (refreshToken && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
