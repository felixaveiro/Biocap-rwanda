// src/lib/api/client.ts

import { authCookies } from "@/lib/auth/cookies";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://biocapapi.afs-rwanda.org";
  
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
  cache?: RequestCache;
  auth?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;


function handleAuthFailure() {
  authCookies.clearAll();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/login")) {
    window.location.href = "/auth/login?expired=true";
  }
}

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(payload));
    return decoded?.id ?? null;
  } catch {
    return null;
  }
}

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = authCookies.getRefreshToken();

  if (!refreshToken) {
    handleAuthFailure();
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  const userId =
    authCookies.getUserId() || getUserIdFromToken(authCookies.getToken());

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken, userId }),
      });

      // Handle 400, 401, and 403 as expired/invalid refresh sessions
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        handleAuthFailure();
        return null;
      }

      if (!res.ok) {
        handleAuthFailure();
        return null;
      }

      const data = await res.json().catch(() => null);

      if (data && typeof data === "object" && "accessToken" in data) {
        const accessToken = String(data.accessToken);
        authCookies.setToken(accessToken);
        if ("refreshToken" in data && data.refreshToken) {
          authCookies.setRefreshToken(String(data.refreshToken));
        }
        return accessToken;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Token refresh network failure:", msg);
    } finally {
      refreshPromise = null;
    }

    handleAuthFailure();
    return null;
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false, cache } = options;

  const isPublicRoute = path.includes("/public");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth && !isPublicRoute) {
    const token = authCookies.getToken();
    if (!token) {
      handleAuthFailure();
      throw new ApiError("You must be logged in to perform this action.", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection.",
      0
    );
  }

  if (
    response.status === 401 &&
    auth &&
    !isPublicRoute &&
    !path.includes("/refresh") &&
    !path.includes("/login")
  ) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      try {
        response = await fetch(`${BASE_URL}${path}`, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          cache,
        });
      } catch {
        throw new ApiError(
          "Could not reach the server. Check your connection.",
          0
        );
      }
    } else {
      throw new ApiError("Session expired. Please log in again.", 401);
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(String(message), response.status);
  }

  return data as T;
}

interface FormRequestOptions {
  method?: "POST" | "PUT";
  formData: FormData;
  auth?: boolean;
}

export async function apiFormRequest<T>(
  path: string,
  options: FormRequestOptions
): Promise<T> {
  const { method = "POST", formData, auth = true } = options;

  const isPublicRoute = path.includes("/public");
  const headers: Record<string, string> = {};

  if (auth && !isPublicRoute) {
    const token = authCookies.getToken();
    if (!token) {
      handleAuthFailure();
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

  if (
    response.status === 401 &&
    auth &&
    !isPublicRoute &&
    !path.includes("/refresh") &&
    !path.includes("/login")
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
    } else {
      throw new ApiError("Session expired. Please log in again.", 401);
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(String(message), response.status);
  }

  return data as T;
}