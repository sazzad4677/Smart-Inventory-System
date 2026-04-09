"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { ProductInput, ProductSchema } from "@/lib/validations";
import { ActionResult, Product } from "@/lib/types";
import { runAction } from "@/lib/error-utils";
import { buildQuery } from "@/lib/buildQuery";

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
  return runAction(async () => {
    const response = await apiFetch(`/products${buildQuery(params)}`);
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
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  return runAction(async () => {
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
  return runAction(async () => {
    await apiFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stock_quantity: current_stock + quantity_to_add }),
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
  return runAction(async () => {
    const response = await apiFetch(`/products/${productId}`);
    const { data } = await response.json();

    await apiFetch(`/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({
        stock_quantity: data.stock_quantity + addedStock,
      }),
    });

    revalidatePath("/restock-queue");
    revalidatePath("/inventory");
  }, "Failed to restock product");
}
