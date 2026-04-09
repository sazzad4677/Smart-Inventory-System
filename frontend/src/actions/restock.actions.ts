"use server";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/buildQuery";
import { runAction } from "@/lib/error-utils";
import { ActionResult, Product, PaginatedResponse } from "@/lib/types";

export interface GetRestockParams {
  page?: string;
  limit?: string;
  searchTerm?: string;
}

export async function getRestockQueue(
  params?: GetRestockParams,
): Promise<ActionResult<PaginatedResponse<Product>>> {
  return runAction(async () => {
    const response = await apiFetch(`/restock-queue${buildQuery(params)}`, {
      next: { tags: ["restock-queue"] },
    });
    const result = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  }, "Failed to fetch restock queue");
}
