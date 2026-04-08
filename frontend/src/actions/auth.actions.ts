"use server";

import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import { ActionResult } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";
import { UserLoginInput, UserSignupInput } from "@/lib/validations";
import { User } from "@/lib/types";

// ─── Cookie helpers ────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

async function setAuthCookies(accessToken: string, response: Response) {
  const store = await cookies();
  store.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });

  // Extract refreshToken from api Set-Cookie header
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    // Simple parser for the refreshToken cookie
    const match = setCookie.match(/refreshToken=([^;]+)/);
    if (match && match[1]) {
      store.set("refreshToken", match[1], {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
    }
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  data: UserLoginInput,
): Promise<ActionResult<{ user: User }>> {
  return tryAction(async () => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const { data: result } = await response.json();
    await setAuthCookies(result.accessToken, response);
    return { user: result.user as User };
  }, "Login failed");
}

// ─── Signup ───────────────────────────────────────────────────────────────────

export async function signupAction(
  data: UserSignupInput,
): Promise<ActionResult<{ user: User }>> {
  return tryAction(async () => {
    const response = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const { data: result } = await response.json();
    await setAuthCookies(result.accessToken, response);
    return { user: result.user as User };
  }, "Signup failed");
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<ActionResult> {
  return tryAction(async () => {
    const store = await cookies();
    const refreshToken = store.get("refreshToken")?.value;

    await apiFetch("/auth/logout", {
      method: "POST",
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    // Clear both cookies
    store.delete("accessToken");
    store.delete("refreshToken");
  }, "Logout failed");
}

// ─── Current User ─────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiFetch("/auth/me");
    const { data } = await response.json();
    return (data?.user as User) ?? null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
