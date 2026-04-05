"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { CategorySchema } from "@/lib/validations";
import { ActionResult, Category } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export async function getCategoriesAction(): Promise<ActionResult<Category[]>> {
  return tryAction(async () => {
    const response = await apiFetch("/categories", {
      next: { tags: ["categories"] },
    });

    const result = await response.json();
    return result.data || [];
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
