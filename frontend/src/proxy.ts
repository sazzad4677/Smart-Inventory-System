import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define public routes
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname === "/" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  // If no token and not a public route, redirect to login with callbackUrl
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and on login/signup, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect / to /dashboard if logged in
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
