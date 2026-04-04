import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      const cookieStore = await cookies();
      cookieStore.delete("token");
      cookieStore.delete("user");
      redirect("/login");
    }

    return response;
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error(`Fetch API Error [${endpoint}]:`, error);
    throw error;
  }
}
