"use server";

import { apiFetch } from "@/lib/api";
import { runAction } from "@/lib/error-utils";
import { revalidatePath } from "next/cache";

export async function inviteUserAction(data: { email: string; role: string }) {
  return runAction(async () => {
    const response = await apiFetch("/invitations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath("/invitations");
    const result = await response.json();
    return result.data;
  }, "Failed to send invitation");
}

export async function getInvitationsAction() {
  try {
    const response = await apiFetch("/invitations");
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return [];
  }
}

export async function revokeInvitationAction(id: string) {
  return runAction(async () => {
    await apiFetch(`/invitations/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/invitations");
    return { success: true };
  }, "Failed to revoke invitation");
}
