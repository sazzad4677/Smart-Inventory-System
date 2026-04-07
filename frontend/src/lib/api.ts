import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isRedirectError(error: unknown): boolean {
  const err = error as { digest?: string };
  return (
    typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")
  );
}

// ─── token refresh ──────────────────────────────────────────────────────

async function tryRefreshToken(): Promise<boolean> {
  const store = await cookies();
  const refreshToken = store.get("refreshToken")?.value;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const { data } = await res.json();
    if (!data?.accessToken) return false;

    store.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return true;
  } catch {
    return false;
  }
}

// ─── Main fetch ────────────────────────────────────────────────────────────────

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const store = await cookies();
  const token = store.get("accessToken")?.value;

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("/")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/${endpoint}`;

  try {
    const response = await fetch(url, { ...options, headers });

    // 401 → try a silent refresh, then retry once
    if (response.status === 401 && !endpoint.includes("/auth/")) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) redirect("/login");

      const newToken = (await cookies()).get("accessToken")?.value;
      const retryHeaders = new Headers(options.headers);
      if (newToken) retryHeaders.set("Authorization", `Bearer ${newToken}`);
      if (options.body && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }
      return fetch(url, { ...options, headers: retryHeaders });
    }

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new ApiError(
        result.message ?? "Something went wrong",
        response.status,
        result.data,
      );
    }

    return response;
  } catch (error) {
    if (isRedirectError(error) || error instanceof ApiError) throw error;
    throw error;
  }
}
