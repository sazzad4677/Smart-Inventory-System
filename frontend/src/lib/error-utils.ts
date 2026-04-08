import { ApiError, isRedirectError } from "./api";
import { ActionResult } from "./types";

// ─── Error handler ────────────────────────────────────────────────────────────

export function handleActionError<T>(
  error: unknown,
  fallbackMessage = "Something went wrong",
): ActionResult<T> {
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

// ─── Action wrapper ───────────────────────────────────────────────────────────

export async function tryAction<T>(
  action: () => Promise<T>,
  fallbackMessage?: string,
): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await action() };
  } catch (error) {
    return handleActionError(error, fallbackMessage);
  }
}
