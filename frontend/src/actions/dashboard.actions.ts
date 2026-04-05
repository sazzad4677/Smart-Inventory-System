"use server";

import { apiFetch } from "@/lib/api";
import { ActionResult } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export async function getDashboardData(): Promise<ActionResult<unknown>> {
  return tryAction(async () => {
    const response = await apiFetch("/dashboard", {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    const result = await response.json();
    return result.data;
  }, "Failed to fetch dashboard data");
}

export async function getLatestActivities(): Promise<ActionResult<unknown[]>> {
  return tryAction(async () => {
    const response = await apiFetch("/activities", {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    const result = await response.json();
    return result.data;
  }, "Failed to fetch activities");
}
