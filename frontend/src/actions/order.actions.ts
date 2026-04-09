"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { OrderInput, OrderStatusType } from "@/lib/validations";
import { runAction } from "@/lib/error-utils";
import { ActionResult, Order, OrderDetailResponse } from "@/lib/types";
import { buildQuery } from "@/lib/buildQuery";

export interface GetOrdersParams {
  page?: string | number;
  limit?: string | number;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export type OrdersResponse = {
  data: Order[];
  meta: { page: number; limit: number; total: number; totalPage: number };
};

export async function getOrdersAction(
  params?: GetOrdersParams,
): Promise<ActionResult<OrdersResponse>> {
  return runAction(async () => {
    const response = await apiFetch(`/orders${buildQuery(params)}`, {
      next: { tags: ["orders"] },
    });
    const result = await response.json();
    return {
      data: result.data || [],
      meta: result.meta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  }, "Failed to fetch orders");
}

export async function getOrderByIdAction(
  id: string,
): Promise<ActionResult<OrderDetailResponse>> {
  return runAction(async () => {
    const response = await apiFetch(`/orders/${id}`, {
      next: { tags: [`order-${id}`] },
    });
    const result = await response.json();
    return result.data;
  }, "Failed to fetch order");
}

export async function createOrderAction(
  data: OrderInput,
): Promise<ActionResult> {
  return runAction(async () => {
    await apiFetch("/orders", { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
  }, "Failed to create order");
}

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatusType,
): Promise<ActionResult> {
  return runAction(async () => {
    await apiFetch(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/dashboard");
  }, "Failed to update order status");
}

export async function deleteOrderAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await apiFetch(`/orders/${id}`, { method: "DELETE" });
    revalidatePath("/orders");
    revalidatePath("/dashboard");
  }, "Failed to delete order");
}
