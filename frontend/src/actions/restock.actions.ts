"use server";

import { apiFetch } from "@/lib/api";
import { ActionResult } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export async function getRestockQueue(): Promise<ActionResult<unknown[]>> {
  return tryAction(async () => {
    const response = await apiFetch("/restock-queue", {
      next: { tags: ["restock-queue"] },
    });

    const result = await response.json();
    return result.data || [];
  }, "Failed to fetch restock queue");
}
