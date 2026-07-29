import { apiRequest } from "./client";
import { User, Role } from "@/types";

// ---- Request Payload Types ----

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  dateOfBirth?: string; // "YYYY-MM-DD"
  organization?: string;
  organizationLink?: string;
  socialHandle?: string;
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
  new_password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateMePayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  organizationLink?: string;
  socialHandle?: string;
  dateOfBirth?: string;
}

// ---- Response Types ----

export interface RegisterResponse {
  message: string;
  username: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
  username: string;
  expiresIn: string;
}

export interface UserProfile extends User {}

// ---- API Functions ----

/**
 * Public direct registration with user-provided password.
 * (Role 'admin' cannot be self-assigned)
 */
export function registerUser(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

/**
 * Public login endpoint.
 * Returns access token, refresh token, role, and username.
 */
export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

/**
 * Requests a password reset link sent via email.
 */
export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * Verifies reset token and updates the user's password.
 */
export function resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

/**
 * Changes current logged-in user password.
 */
export function changePassword(payload: ChangePasswordPayload) {
  return apiRequest<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

/**
 * Fetches current logged-in user's profile.
 */
export function getMe() {
  return apiRequest<UserProfile>("/api/auth/me", {
    method: "GET",
    auth: true,
  });
}

/**
 * Updates logged-in user's profile fields.
 */
export function updateMe(payload: UpdateMePayload) {
  return apiRequest<UserProfile>("/api/auth/me", {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

/**
 * Logs out the user and invalidates the session refresh token.
 */
export function logoutUser() {
  return apiRequest<{ message: string }>("/api/auth/logout", {
    method: "POST",
    auth: true,
  });
}