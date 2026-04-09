"use server";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/buildQuery";
import { runAction } from "@/lib/error-utils";
import { ActionResult, Activity, PaginatedResponse } from "@/lib/types";

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
