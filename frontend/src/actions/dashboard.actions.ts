"use server";

import { apiFetch } from "@/lib/api";

export async function getDashboardData() {
  try {
    const response = await apiFetch("/dashboard", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to fetch dashboard data",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function getLatestActivities() {
  try {
    const response = await apiFetch("/activities", {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to fetch activities",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Activities Fetch Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
