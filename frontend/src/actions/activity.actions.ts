"use server";

import { apiFetch } from "@/lib/api";
import { ActionResult, Activity, PaginatedResponse } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export async function getActivityLogs(
  queryParams: Record<string, string | number | undefined> = {},
): Promise<ActionResult<PaginatedResponse<Activity>>> {
  return tryAction(async () => {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    const response = await apiFetch(
      `/activity-logs?${searchParams.toString()}`,
      {
        next: { revalidate: 0 }, // Don't cache activity logs for real-time feel
      },
    );

    const result = await response.json();
    return result;
  }, "Failed to fetch activity logs");
}
