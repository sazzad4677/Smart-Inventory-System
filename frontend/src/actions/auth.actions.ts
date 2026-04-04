"use server";

import { cookies } from "next/headers";
import { UserLoginInput, UserSignupInput } from "@/lib/validations";
import { apiFetch } from "@/lib/api";

export async function loginAction(data: UserLoginInput) {
  try {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Invalid credentials" };
    }

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

    return { success: true };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function signupAction(data: UserSignupInput) {
  try {
    const response = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Signup failed" };
    }

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

    return { success: true };
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
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
