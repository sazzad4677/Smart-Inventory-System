import { ApiError, isRedirectError } from "./api";
import { ActionResult } from "./types";

export async function runAction<T>(
  action: () => Promise<T>,
  fallbackMessage = "Something went wrong",
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof ApiError) {
      return { success: false, error: error.message, statusCode: error.status };
    }
    console.error("Action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : fallbackMessage,
    };
  }
}
