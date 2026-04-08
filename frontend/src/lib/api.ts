import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

const ACCESS_TOKEN_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 60,
  path: "/",
};

// ─── Errors ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(endpoint: string): string {
  return endpoint.startsWith("/")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/${endpoint}`;
}

function buildHeaders(options: RequestInit, token?: string): Headers {
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new ApiError(
      result.message ?? "Something went wrong",
      response.status,
      result.data,
    );
  }
}

// ─── Token refresh ────────────────────────────────────────────────────────────

async function tryRefreshToken(): Promise<string | null> {
  const store = await cookies();
  const refreshToken = store.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const { data } = await res.json();
    if (!data?.accessToken) return null;

    try {
      store.set("accessToken", data.accessToken, ACCESS_TOKEN_COOKIE);
    } catch {
      // Setting cookies is not allowed in Server Components; use the in-memory token instead.
      console.warn(
        "Could not persist refreshed access token (likely a Server Component context)",
      );
    }

    return data.accessToken;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const store = await cookies();
  const token = store.get("accessToken")?.value;
  const url = buildUrl(endpoint);

  try {
    const response = await fetch(url, {
      ...options,
      headers: buildHeaders(options, token),
    });

    if (response.status === 401 && !endpoint.includes("/auth/")) {
      const newToken = await tryRefreshToken();
      if (!newToken) redirect("/login");

      const retried = await fetch(url, {
        ...options,
        headers: buildHeaders(options, newToken),
      });
      await throwIfNotOk(retried);
      return retried;
    }

    await throwIfNotOk(response);
    return response;
  } catch (error) {
    if (isRedirectError(error) || error instanceof ApiError) throw error;
    throw error;
  }
}
