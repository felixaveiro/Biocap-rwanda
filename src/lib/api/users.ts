import { apiRequest } from "./client";
import { User, Role, PaginatedResponse, ProfileReviewStatus } from "@/types";

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organization?: string;
  organizationLink?: string;
  socialHandle?: string;
  dateOfBirth?: string;
}

export interface UpdateUserPayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  organization?: string;
  organizationLink?: string;
  socialHandle?: string;
}

export interface UserReviewPayload {
  decision: "verified" | "needs_attention" | "noted";
  note?: string;
}

export interface UserFilterOptions {
  role?: string;
  isActive?: boolean;
  profileReviewStatus?: ProfileReviewStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Helper to select base route path based on requester role ────────────────
function getUserBasePath(requesterRole?: Role): string {
  return requesterRole === "communication_officer" ? "/api/officer" : "/api/admin";
}

export const usersApi = {
  /**
   * Create a user directly with password (Admin & Officer)
   */
  async createUser(payload: CreateUserPayload): Promise<{ message: string; user: Partial<User> }> {
    return apiRequest<{ message: string; user: Partial<User> }>("/api/admin/users", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  /**
   * Fetch paginated list of users
   */
  async listUsers(requesterRole?: Role, params: UserFilterOptions = {}): Promise<PaginatedResponse<User>> {
    const basePath = getUserBasePath(requesterRole);
    const query = new URLSearchParams();

    if (params.role) query.append("role", params.role);
    if (params.isActive !== undefined) query.append("isActive", String(params.isActive));
    if (params.profileReviewStatus) query.append("profileReviewStatus", params.profileReviewStatus);
    if (params.search) query.append("search", params.search);
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<PaginatedResponse<User>>(`${basePath}/users${queryString}`, { auth: true });
  },

  /**
   * Get single user profile with blog activity metrics
   */
  async getUserById(id: string, requesterRole?: Role): Promise<User & { recentBlogs?: unknown[] }> {
    const basePath = getUserBasePath(requesterRole);
    return apiRequest<User & { recentBlogs?: unknown[] }>(`${basePath}/users/${id}`, { auth: true });
  },

  /**
   * Fetch verification queue for external contributors
   */
  async getReviewQueue(requesterRole?: Role): Promise<{ count: number; users: User[] }> {
    const basePath = getUserBasePath(requesterRole);
    return apiRequest<{ count: number; users: User[] }>(`${basePath}/users/review-queue`, { auth: true });
  },

  /**
   * Update user details (Admin only)
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>(`/api/admin/users/${id}`, {
      method: "PUT",
      auth: true,
      body: payload,
    });
  },

  /**
   * Change user role (Admin only)
   */
  async changeUserRole(id: string, role: Role, organizationLink?: string): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      auth: true,
      body: { role, organizationLink },
    });
  },

  /**
   * Submit profile verification review (Admin & Communication Officer)
   */
  async reviewUser(id: string, payload: UserReviewPayload, requesterRole?: Role): Promise<{ message: string; user: User }> {
    const basePath = getUserBasePath(requesterRole);
    return apiRequest<{ message: string; user: User }>(`${basePath}/users/${id}/review`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  /**
   * Deactivate user account (Admin only)
   */
  async deactivateUser(id: string): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>(`/api/admin/users/${id}/deactivate`, {
      method: "PATCH",
      auth: true,
    });
  },

  /**
   * Reactivate user account (Admin only)
   */
  async reactivateUser(id: string): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>(`/api/admin/users/${id}/reactivate`, {
      method: "PATCH",
      auth: true,
    });
  },

  /**
   * Permanently delete user account (Admin only)
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/admin/users/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};