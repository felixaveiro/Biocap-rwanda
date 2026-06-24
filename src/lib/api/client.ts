import { authCookies } from "@/lib/auth/cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Thrown for every failed request (network error, 4xx, 5xx).
 * Always carries a human-readable `message` and the HTTP `status`,
 * so calling code can show the right thing to the user without
 * re-parsing the response itself.
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Set true for endpoints that require the Bearer token (most non-public routes). */
  auth?: boolean;
}

/**
 * Generic typed request function. Every function in auth.ts / blogs.ts
 * calls this instead of `fetch` directly.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  if (!BASE_URL) {
    // Fails loudly and early instead of a confusing "Failed to fetch" later.
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Check your .env.local file.",
      500
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = authCookies.getToken();
    if (!token) {
      throw new ApiError("You must be logged in to do this.", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection.",
      0
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}