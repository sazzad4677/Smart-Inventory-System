import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 60,
  path: "/",
};

const PUBLIC_ROUTE_PREFIXES = ["/login", "/signup", "/api", "/_next"];

const AUTH_ONLY_ROUTES = ["/login", "/signup", "/"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(
      decodeURIComponent(
        json
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join(""),
      ),
    );
  } catch {
    return null;
  }
}

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes(".")
  );
}

function isTokenExpiringSoon(token: string): boolean {
  const decoded = parseJwt(token);
  return !decoded || (decoded.exp as number) * 1000 - Date.now() < 60_000;
}

// ─── Token refresh ────────────────────────────────────────────────────────────

async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  const API_URL =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refreshToken=${refreshToken}`,
    },
  });

  if (!res.ok) return null;

  const { data } = await res.json();
  return typeof data?.accessToken === "string" ? data.accessToken : null;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let accessToken = request.cookies.get("accessToken")?.value;

  // 1. Unauthenticated user on a protected route → redirect to login
  if (!refreshToken && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user on an auth-only route → redirect to dashboard
  if (refreshToken && AUTH_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  let response = NextResponse.next();

  // 3. Proactively refresh the access token when missing or near-expiry
  if (refreshToken && !isPublicRoute(pathname)) {
    const needsRefresh = !accessToken || isTokenExpiringSoon(accessToken);

    if (needsRefresh) {
      try {
        const newAccessToken = await refreshAccessToken(refreshToken);

        if (newAccessToken) {
          accessToken = newAccessToken;
          request.cookies.set("accessToken", newAccessToken);

          const headers = new Headers(request.headers);
          headers.set("cookie", request.cookies.toString());

          response = NextResponse.next({ request: { headers } });
          response.cookies.set(
            "accessToken",
            newAccessToken,
            ACCESS_TOKEN_COOKIE,
          );
        } else {
          // Refresh token is expired or invalid — clear session
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("callbackUrl", pathname);

          const redirectResponse = NextResponse.redirect(loginUrl);
          redirectResponse.cookies.delete("accessToken");
          redirectResponse.cookies.delete("refreshToken");
          return redirectResponse;
        }
      } catch (error) {
        console.error("Middleware token refresh error:", error);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
