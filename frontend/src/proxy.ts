import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/inventory",
  "/categories",
  "/orders",
  "/activity",
];
const publicRoutes = ["/login", "/signup"];

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/"),
  );
  const isPublicRoute = publicRoutes.includes(path);

  // Redirect / to /dashboard if logged in, or to /login if not
  if (path === "/") {
    return NextResponse.redirect(
      new URL(token ? "/dashboard" : "/login", req.nextUrl),
    );
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
