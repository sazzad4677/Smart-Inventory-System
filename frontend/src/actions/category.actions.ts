"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { CategorySchema } from "@/lib/validations";
import { ActionResult, Category, PaginatedResponse } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export async function getCategoriesAction(params?: {
  page?: string;
  limit?: string;
  searchTerm?: string;
}): Promise<ActionResult<PaginatedResponse<Category>>> {
  return tryAction(async () => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page);
    if (params?.limit) query.append("limit", params.limit);
    if (params?.searchTerm) query.append("searchTerm", params.searchTerm);

    const queryString = query.toString();
    const url = `/categories${queryString ? `?${queryString}` : ""}`;

    const response = await apiFetch(url, {
      next: { tags: ["categories"] },
    });

    const result = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  }, "Failed to fetch categories");
}

export async function createCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0].message,
    };
  }

  const { name } = validatedFields.data;

  return tryAction(async () => {
    await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    revalidatePath("/categories");
  }, "Failed to create category");
}
