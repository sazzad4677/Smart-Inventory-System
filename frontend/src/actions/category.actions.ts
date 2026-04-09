"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { CategorySchema } from "@/lib/validations";
import { runAction } from "@/lib/error-utils";
import { ActionResult, Category, PaginatedResponse } from "@/lib/types";
import { buildQuery } from "@/lib/buildQuery";

export interface GetCategoriesParams {
  page?: string;
  limit?: string;
  searchTerm?: string;
}

export async function getCategoriesAction(
  params?: GetCategoriesParams,
): Promise<ActionResult<PaginatedResponse<Category>>> {
  return runAction(async () => {
    const response = await apiFetch(`/categories${buildQuery(params)}`, {
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
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  return runAction(async () => {
    await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify(validatedFields.data),
    });
    revalidatePath("/categories");
  }, "Failed to create category");
}
