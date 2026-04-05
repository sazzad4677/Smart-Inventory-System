"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { ProductInput, ProductSchema } from "@/lib/validations";
import { ActionResult, Product } from "@/lib/types";
import { tryAction } from "@/lib/error-utils";

export interface GetProductsParams {
  searchTerm?: string;
  category_id?: string;
  page?: string | number;
  limit?: string | number;
}

export type ProductsResponse = {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPage: number };
};

export async function getProductsAction(
  params?: GetProductsParams,
): Promise<ActionResult<ProductsResponse>> {
  return tryAction(async () => {
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

    return {
      data: result.data || [],
      meta: result.meta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  }, "Failed to fetch products");
}

export async function createProductAction(
  data: ProductInput,
): Promise<ActionResult> {
  const validatedFields = ProductSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0].message,
    };
  }

  return tryAction(async () => {
    await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(validatedFields.data),
    });

    revalidatePath("/inventory");
  }, "Failed to create product");
}

export async function updateProductStockAction(
  id: string,
  current_stock: number,
  quantity_to_add: number,
): Promise<ActionResult> {
  return tryAction(async () => {
    const new_stock = current_stock + quantity_to_add;

    await apiFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stock_quantity: new_stock }),
    });

    revalidatePath("/inventory");
    revalidatePath("/restock-queue");
    revalidatePath("/dashboard");
  }, "Failed to update stock");
}

export async function restockProductAction(
  productId: string,
  addedStock: number,
): Promise<ActionResult> {
  return tryAction(async () => {
    const response = await apiFetch(`/products/${productId}`);
    const result = await response.json();

    const currentStock = result.data.stock_quantity;
    const newStock = currentStock + addedStock;

    await apiFetch(`/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ stock_quantity: newStock }),
    });

    revalidatePath("/restock-queue");
    revalidatePath("/inventory");
  }, "Failed to restock product");
}
