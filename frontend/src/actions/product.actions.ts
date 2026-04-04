"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { ProductInput, ProductSchema } from "@/lib/validations";

export interface GetProductsParams {
  searchTerm?: string;
  category_id?: string;
  page?: string | number;
  limit?: string | number;
}

export async function getProductsAction(params?: GetProductsParams) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.searchTerm)
      searchParams.append("searchTerm", params.searchTerm);
    if (params?.category_id)
      searchParams.append("category_id", params.category_id);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

    const response = await apiFetch(endpoint, {
      next: { tags: ["products"] },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch products:", result.message);
      return { data: [], meta: { page: 1, limit: 10, total: 0, totalPage: 0 } };
    }

    return {
      data: result.data || [],
      meta: result.meta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  } catch (error) {
    console.error("Get Products Error:", error);
    return { data: [], meta: { page: 1, limit: 10, total: 0, totalPage: 0 } };
  }
}

export async function createProductAction(data: ProductInput) {
  const validatedFields = ProductSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0].message,
    };
  }

  try {
    const response = await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(validatedFields.data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to create product",
      };
    }

    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function updateProductStockAction(
  id: string,
  current_stock: number,
  quantity_to_add: number,
) {
  try {
    const new_stock = current_stock + quantity_to_add;

    const response = await apiFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stock_quantity: new_stock }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to update stock",
      };
    }

    revalidatePath("/inventory");
    revalidatePath("/restock-queue");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update Stock Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
