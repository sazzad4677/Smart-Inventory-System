import { apiFetch } from "@/lib/api";

export async function getRestockQueue() {
  try {
    const response = await apiFetch("/restock-queue", {
      next: { tags: ["restock-queue"] },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to fetch restock queue",
      };
    }

    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error("Restock Queue Fetch Error:", error);
    return { success: false, error: "Something went wrong", data: [] };
  }
}
