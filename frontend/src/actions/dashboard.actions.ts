"use server";

import { apiFetch } from "@/lib/api";
import { runAction } from "@/lib/error-utils";
import { ActionResult, Activity, DashboardData } from "@/lib/types";

export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  return runAction(async () => {
    const response = await apiFetch("/dashboard", { next: { revalidate: 60 } });
    const result = await response.json();
    return result.data;
  }, "Failed to fetch dashboard data");
}

export async function getLatestActivities(): Promise<ActionResult<Activity[]>> {
  return runAction(async () => {
    const response = await apiFetch("/activities", {
      next: { revalidate: 60 },
    });
    const result = await response.json();
    return result.data;
  }, "Failed to fetch activities");
}
