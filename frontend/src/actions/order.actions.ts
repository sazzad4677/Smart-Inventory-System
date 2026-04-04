"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { OrderInput, OrderStatusType } from "@/lib/validations";

export interface GetOrdersParams {
  page?: string | number;
  limit?: string | number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getOrdersAction(params?: GetOrdersParams) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);

    const queryString = searchParams.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ""}`;

    const response = await apiFetch(endpoint, {
      next: { tags: ["orders"] },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch orders:", result.message);
      return { data: [], meta: { page: 1, limit: 10, total: 0, totalPage: 0 } };
    }

    return {
      data: result.data || [],
      meta: result.meta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  } catch (error) {
    console.error("Get Orders Error:", error);
    return { data: [], meta: { page: 1, limit: 10, total: 0, totalPage: 0 } };
  }
}

export async function getOrderByIdAction(id: string) {
  try {
    const response = await apiFetch(`/orders/${id}`, {
      next: { tags: [`order-${id}`] },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to fetch order",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Get Order Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function createOrderAction(data: OrderInput) {
  try {
    const response = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to create order",
      };
    }

    revalidatePath("/orders");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create Order Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatusType,
) {
  try {
    const response = await apiFetch(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to update order status",
      };
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function deleteOrderAction(id: string) {
  try {
    const response = await apiFetch(`/orders/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to delete order",
      };
    }

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete Order Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
