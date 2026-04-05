"use server";

import { cookies } from "next/headers";
import { UserLoginInput, UserSignupInput } from "@/lib/validations";
import { apiFetch } from "@/lib/api";
import { ActionResult } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export async function loginAction(data: UserLoginInput): Promise<ActionResult> {
  return tryAction(async () => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set("token", result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    if (result.data?.user) {
      const cookieStore = await cookies();
      cookieStore.set("user", JSON.stringify(result.data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }, "Login failed");
}

export async function signupAction(
  data: UserSignupInput,
): Promise<ActionResult> {
  return tryAction(async () => {
    const response = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set("token", result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    if (result.data?.user) {
      const cookieStore = await cookies();
      cookieStore.set("user", JSON.stringify(result.data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
  }, "Signup failed");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("user");
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user")?.value;

  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    return null;
  }
}
