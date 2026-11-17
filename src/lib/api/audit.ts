import { apiRequest } from "./client";

export interface AuditLogFilters {
  action?: string;
  actor?: string;
  actorRole?: string;
  targetModel?: "User" | "Blog" | "Gallery";
  targetId?: string;
  from?: string;
  to?: string;
}

export interface AuditLogActor {
  _id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface AuditLog {
  _id: string;
  actor: AuditLogActor | string | null;
  actorRole?: string;
  actorLabel?: string;
  action: string;
  targetModel: string;
  targetId: string;
  targetLabel?: string;
  detail?: unknown;
  ip?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  timestamp: string;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: AuditLogPagination;
}

export interface BlogAuditLogResponse {
  count: number;
  logs: AuditLog[];
}

export interface UserAuditLogResponse {
  actionsOnThisUser: AuditLog[];
  actionsPerformedByThisUser: AuditLog[];
}

export async function getAdminAuditLogs(
  filters: AuditLogFilters,
  page: number,
  limit: number
): Promise<AuditLogResponse> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });

  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }

  return apiRequest<AuditLogResponse>(
    `/api/admin/audit-logs?${query.toString()}`,
    { auth: true, cache: "no-store" }
  );
}

export async function getAdminAuditLogsByBlog(id: string): Promise<BlogAuditLogResponse> {
  return apiRequest<BlogAuditLogResponse>(
    `/api/admin/audit-logs/blog/${encodeURIComponent(id)}`,
    { auth: true, cache: "no-store" }
  );
}

export async function getAdminAuditLogsByUser(id: string): Promise<UserAuditLogResponse> {
  return apiRequest<UserAuditLogResponse>(
    `/api/admin/audit-logs/user/${encodeURIComponent(id)}`,
    { auth: true, cache: "no-store" }
  );
}
