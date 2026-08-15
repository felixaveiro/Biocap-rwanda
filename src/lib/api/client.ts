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

// Single active promise to handle concurrent 401 retries gracefully
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = authCookies.getRefreshToken();

  if (!refreshToken) {
    authCookies.clearAll();
    return null;
  }

  // If a refresh request is already running, reuse it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const endpoints = [
      `${BASE_URL}/api/auth/refresh-token`,
      `${BASE_URL}/api/auth/refresh`,
    ];

    try {
      for (const url of endpoints) {
        try {
          // Try common body shapes that backends might expect
          const candidates = [
            JSON.stringify({ refreshToken }),
            JSON.stringify({ token: refreshToken }),
            JSON.stringify({ refresh_token: refreshToken }),
            null, // allow sending no body (some servers rely on cookies)
          ];

          let res: Response | null = null;

          for (const body of candidates) {
            try {
              res = await fetch(url, {
                method: "POST",
                headers: body ? { "Content-Type": "application/json" } : {},
                // If the backend uses cookie-based refresh we still attempt a credentials-included request
                credentials: "include",
                body: body ?? undefined,
              });
            } catch (innerErr) {
              console.warn("Refresh attempt failed, trying next candidate:", innerErr);
              res = null;
            }

            if (!res) continue;

            // If explicit auth failure, clear session and stop trying
            if (res.status === 401 || res.status === 403) {
              authCookies.clearAll();
              return null;
            }

            // If endpoint not found, try next fallback endpoint
            if (res.status === 404) {
              res = null;
              continue;
            }

            // For bad request (400) or other client errors, try other candidates/endpoints instead of clearing session
            if (res.status >= 400 && res.status < 500) {
              // allow trying other payload shapes or endpoints
              res = null;
              continue;
            }

            // For server errors, give up and return null (transient)
            if (res.status >= 500) return null;

            // Successful-ish response
            break;
          }

          if (!res) continue;

          const data = await res.json().catch(() => null);
          if (data && data.accessToken) {
            authCookies.setToken(data.accessToken);
            if (data.refreshToken) authCookies.setRefreshToken(data.refreshToken);
            return data.accessToken;
          }
        } catch (innerErr) {
          // Try next endpoint; don't clear session on transient network errors
          console.warn("Refresh endpoint attempt failed, trying fallback:", innerErr);
          continue;
        }
      }
    } finally {
      refreshPromise = null;
    }

    return null;
  })();

  return refreshPromise;
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

  // Exclude refresh endpoints to prevent infinite loops
  if (
    response.status === 401 &&
    auth &&
    !path.includes("/refresh-token") &&
    !path.includes("/refresh")
  ) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
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

  // Exclude refresh endpoints
  if (
    response.status === 401 &&
    auth &&
    !path.includes("/refresh-token") &&
    !path.includes("/refresh")
  ) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
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