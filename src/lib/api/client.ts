import { authCookies } from "@/lib/auth/cookies";

const BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  "https://biocap-dashboard-backend.onrender.com";

/**
 * Thrown for every failed request (network error, 4xx, 5xx).
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
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  /** Set true for endpoints that require the Bearer token */
  auth?: boolean;
}

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = authCookies.getRefreshToken();
  const userId = authCookies.getUserId();

  if (!refreshToken || !userId) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, userId }),
    });

    if (!res.ok) {
      authCookies.clearAll();
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      authCookies.setToken(data.accessToken);
      return data.accessToken;
    }
  } catch {
    authCookies.clearAll();
  }
  return null;
}

/**
 * Generic typed request function with automatic token refresh on 401 errors.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = authCookies.getToken();
    if (!token) {
      throw new ApiError("You must be logged in to perform this action.", 401);
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

  // Handle 401 Unauthorized token expiry with automatic retry
  if (response.status === 401 && auth) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
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

interface FormRequestOptions {
  method?: "POST" | "PUT";
  formData: FormData;
  auth?: boolean;
}

/**
 * Multipart request handler for image & file uploads (Blog Creation/Updates).
 */
export async function apiFormRequest<T>(
  path: string,
  options: FormRequestOptions
): Promise<T> {
  const { method = "POST", formData, auth = true } = options;

  const headers: Record<string, string> = {};

  if (auth) {
    const token = authCookies.getToken();
    if (!token) {
      throw new ApiError("You must be logged in to perform this action.", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection.",
      0
    );
  }

  if (response.status === 401 && auth) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: formData,
      });
    }
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