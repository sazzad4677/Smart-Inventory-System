import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
export { isRedirectError } from "next/dist/client/components/redirect-error";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

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

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await auth();
  if (session?.error === "RefreshAccessTokenError") {
    await signOut({ redirect: false });
    redirect("/login");
  }
  const token = session?.accessToken as string | undefined;

  const url = endpoint.startsWith("/")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/${endpoint}`;

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !endpoint.includes("/auth/")) {
    await signOut({ redirect: false });
    redirect("/login");
  }

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new ApiError(
      result.message ?? "Something went wrong",
      response.status,
      result.data,
    );
  }

  return response;
}
