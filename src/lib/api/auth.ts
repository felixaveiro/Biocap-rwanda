import { apiRequest, ApiError } from "./client";
import { User, Role } from "@/types";
import { authCookies } from "@/lib/auth/cookies";

// ─── Request Payload Types ───────────────────────────────────────────────────

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  dateOfBirth?: string; // "YYYY-MM-DD"
  organization?: string;
  jobTitle?: string;
  job_title?: string;
  title?: string;
  organizationLink?: string;
  organization_link?: string;
  socialHandle?: string;
  social_handle?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword?: string;
  new_password?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface UpdateMePayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  jobTitle?: string;
  job_title?: string;
  title?: string;
  organizationLink?: string;
  organization_link?: string;
  socialHandle?: string;
  social_handle?: string;
  dateOfBirth?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  job_title?: string;
  title?: string;
  organizationLink?: string;
  organization_link?: string;
  socialHandle?: string;
  social_handle?: string;
  dateOfBirth?: string;
}

// ─── Response Types ──────────────────────────────────────────────────────────

export interface RegisterResponse {
  message: string;
  username?: string;
  role?: Role;
  user?: User;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
  username: string;
  expiresIn?: string;
  user?: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface UserProfile extends User {}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * Public direct registration with user-provided password.
 */
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

/**
 * Public login endpoint.
 * Returns access token, refresh token, role, and username, and persists session cookies.
 */
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });

  if (res.accessToken) {
    authCookies.setSession({
      token: res.accessToken,
      refreshToken: res.refreshToken,
      userId: res.user?._id,
      role: res.role || res.user?.role || "",
      username: res.username || res.user?.username || "",
    });
  }

  return res;
}

/**
 * Refresh access token using current refresh token.
 */
export async function refreshSession(): Promise<RefreshTokenResponse | null> {
  const currentRefreshToken = authCookies.getRefreshToken();
  if (!currentRefreshToken) return null;

  const userId = authCookies.getUserId();
  const payload = { refreshToken: currentRefreshToken, userId };

  const endpoints = ["/api/auth/refresh", "/api/auth/refresh-token"];

  for (const endpoint of endpoints) {
    try {
      const res = await apiRequest<RefreshTokenResponse>(endpoint, {
        method: "POST",
        body: payload,
      });

      if (res && res.accessToken) {
        authCookies.setToken(res.accessToken);
        if (res.refreshToken) authCookies.setRefreshToken(res.refreshToken);
      }

      return res;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) continue;

      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        authCookies.clearSession();
        return null;
      }

      continue;
    }
  }

  authCookies.clearSession();
  return null;
}

/**
 * Requests a password reset link sent via email.
 */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * Verifies reset token and updates the user's password.
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const body = {
    token: payload.token,
    newPassword: payload.newPassword || payload.new_password,
  };

  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body,
  });
}

/**
 * Changes current logged-in user password.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

/**
 * Fetches current logged-in user's profile.
 */
export async function getMe(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/auth/me", {
    method: "GET",
    auth: true,
  });
}

/**
 * Updates logged-in user's profile fields and returns updated profile.
 */
export async function updateMe(payload: UpdateMePayload): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/auth/me", {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

/**
 * Profile updater used by contributor and creator profile settings pages.
 * Directly invokes updateMe (PUT /api/auth/me) with fallback handling for legacy endpoints.
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  try {
    return await updateMe(payload);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await apiRequest<UserProfile>("/api/contributor/profile", {
        method: "PUT",
        body: payload,
        auth: true,
      });
    }
    throw err;
  }
}

/**
 * Logs out the user, clears local cookies, and invalidates session on backend.
 */
export async function logoutUser(): Promise<{ message: string }> {
  try {
    const res = await apiRequest<{ message: string }>("/api/auth/logout", {
      method: "POST",
      auth: true,
    });
    return res;
  } finally {
    authCookies.clearSession();
  }
}