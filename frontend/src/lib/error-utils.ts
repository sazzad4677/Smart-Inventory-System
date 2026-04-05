import { ApiError, isRedirectError } from "./api";
import { ActionResult } from "./types";

/**
 * Common error handler for server actions.
 */
export function handleActionError<T>(
  error: unknown,
  fallbackMessage = "Something went wrong",
): ActionResult<T> {
  // If it's a Next.js redirect error, re-throw it so Next.js can handle the navigation
  if (isRedirectError(error)) {
    throw error;
  }

  // If it's our custom ApiError, use its message and status
  if (error instanceof ApiError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.status,
    };
  }

  // General error handling
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error("Action Error:", error);

  return {
    success: false,
    error: message,
  };
}

/**
 * Standardized wrapper for server actions to handle try-catch and return result.
 */
export async function tryAction<T>(
  action: () => Promise<T>,
  fallbackMessage?: string,
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    return handleActionError(error, fallbackMessage);
  }
}
