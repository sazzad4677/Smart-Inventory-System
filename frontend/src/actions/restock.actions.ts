"use server";

import { apiFetch } from "@/lib/api";
import { ActionResult, Product, PaginatedResponse } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export async function getRestockQueue(params?: {
  page?: string;
  limit?: string;
  searchTerm?: string;
}): Promise<ActionResult<PaginatedResponse<Product>>> {
  return tryAction(async () => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page);
    if (params?.limit) query.append("limit", params.limit);
    if (params?.searchTerm) query.append("searchTerm", params.searchTerm);

    const queryString = query.toString();
    const url = `/restock-queue${queryString ? `?${queryString}` : ""}`;

    const response = await apiFetch(url, {
      next: { tags: ["restock-queue"] },
    });

    const result = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  }, "Failed to fetch restock queue");
}
