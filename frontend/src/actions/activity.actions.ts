"use server";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/buildQuery";
import { runAction } from "@/lib/error-utils";
import { ActionResult, Activity, PaginatedResponse } from "@/lib/types";

import { revalidatePath } from "next/cache";

export async function getActivityLogs(
  params: Record<string, string | number | undefined> = {},
): Promise<ActionResult<PaginatedResponse<Activity>>> {
  return runAction(async () => {
    const response = await apiFetch(`/activity-logs${buildQuery(params)}`, {
      next: { revalidate: 0 },
    });
    const result = await response.json();
    return result;
  }, "Failed to fetch activity logs");
}

export async function undoActivityAction(logId: string): Promise<ActionResult> {
  return runAction(async () => {
    await apiFetch(`/activity-logs/${logId}/undo`, {
      method: "POST",
    });
    revalidatePath("/activity");
    revalidatePath("/products");
    revalidatePath("/dashboard");
  }, "Failed to undo action");
}
export async function redoActivityAction(logId: string): Promise<ActionResult> {
  return runAction(async () => {
    await apiFetch(`/activity-logs/${logId}/redo`, {
      method: "POST",
    });
    revalidatePath("/activity");
    revalidatePath("/products");
    revalidatePath("/dashboard");
  }, "Failed to redo action");
}
