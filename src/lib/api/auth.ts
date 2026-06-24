import { apiRequest } from "./client";

// ---- Request payload types (what we send) ----

export interface RegisterPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  organization: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateMePayload {
  username: string;
}

// ---- Response types (what the server sends back) ----

export interface RegisterResponse {
  message: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  username: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  organization?: string;
}

// ---- API functions ----

export function registerUser(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

/** Requires the user to already be logged in (sends the Bearer token). */
export function getMe() {
  return apiRequest<UserProfile>("/api/auth/me", {
    method: "GET",
    auth: true,
  });
}

export function updateMe(payload: UpdateMePayload) {
  return apiRequest<UserProfile>("/api/auth/me", {
    method: "PUT",
    body: payload,
    auth: true,
  });
}