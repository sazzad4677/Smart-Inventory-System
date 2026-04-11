"use server";

import { apiFetch } from "@/lib/api";
import { runAction } from "@/lib/error-utils";
import { revalidatePath } from "next/cache";

export async function getUsersAction() {
  try {
    const response = await apiFetch("/users");
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function revokeUserSessionsAction(userId: string) {
  return runAction(async () => {
    await apiFetch(`/users/${userId}/sessions`, {
      method: "DELETE",
    });
    revalidatePath("/users");
    return { success: true };
  }, "Failed to revoke user sessions");
}
