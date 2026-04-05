import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { digest?: string };
  return (
    typeof err.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")
  );
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Get the token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Clone and augment headers
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set default Content-Type for POST/PUT if body exists
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Build the full URL
  const url = endpoint.startsWith("/")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized globally
    if (response.status === 401 && !endpoint.includes("/auth/login")) {
      redirect("/login");
    }

    // If response is not OK, try to parse error message from body
    if (!response.ok) {
      let errorMessage = "Something went wrong";
      let errorData;

      try {
        const result = await response.json();
        errorMessage = result.message || errorMessage;
        errorData = result.data;
      } catch {
        // Fallback to status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    return response;
  } catch (error) {
    if (isRedirectError(error) || error instanceof ApiError) {
      throw error;
    }
    console.error(`Fetch API Error [${endpoint}]:`, error);
    throw error;
  }
}
