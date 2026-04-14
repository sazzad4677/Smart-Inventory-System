"use server";

import { signIn } from "@/auth";
import { apiFetch } from "@/lib/api";
import { runAction } from "@/lib/error-utils";
import { UserLoginInput, UserSignupInput } from "@/lib/validations";
import { ActionResult, User } from "@/lib/types";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function loginAction(
  data: UserLoginInput,
): Promise<ActionResult<{ user: User }>> {
  try {
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) return { success: false, error: "Invalid credentials" };
    return { success: true, data: { user: {} as User } };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error:
          error.type === "CredentialsSignin"
            ? "Invalid credentials"
            : "Something went wrong",
      };
    }
    throw error;
  }
}

export async function signupAction(data: UserSignupInput) {
  return runAction(async () => {
    const response = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const { data: result } = await response.json();
    return { user: result.user as User };
  }, "Signup failed");
}

export async function logoutAction(token: string): Promise<ActionResult> {
  return runAction(async () => {
    await apiFetch("/auth/logout", { method: "POST" }, token);
  }, "Logout failed");
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiFetch("/auth/me");
    const { data } = await response.json();
    return (data?.user as User) ?? null;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error fetching current user:", error);
    return null;
  }
}
