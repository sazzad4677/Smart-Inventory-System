"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { CategorySchema } from "@/lib/validations";

export async function getCategoriesAction() {
  try {
    const response = await apiFetch("/categories", {
      next: { tags: ["categories"] },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch categories:", result.message);
      return [];
    }

    return result.data || [];
  } catch (error) {
    console.error("Get Categories Error:", error);
    return [];
  }
}

export async function createCategoryAction(formData: FormData) {
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

  try {
    const response = await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to create category",
      };
    }

    revalidatePath("/categories");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Create Category Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
