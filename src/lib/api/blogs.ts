import { apiRequest, apiFormRequest, ApiError } from "./client";
import {
  BlogPost,
  BlogBlock,
  BlogModalMetadata,
  PaginatedResponse,
  Role,
  User,
  Comment,
  Notification,
} from "@/types";

// ─── Payload Interfaces ────────────────────────────────────────────────────────

export interface CreateBlogPayload {
  title: string;
  tag: string;
  excerpt: string;
  blocks: BlogBlock[];
  modal?: BlogModalMetadata;
  socialHandle?: string;
  organizationLink?: string;
  img: File;
  document?: File;
  images?: File[];
}

export interface UpdateBlogPayload {
  title?: string;
  tag?: string;
  excerpt?: string;
  blocks?: BlogBlock[];
  modal?: BlogModalMetadata;
  socialHandle?: string;
  organizationLink?: string;
  img?: File;
  document?: File;
  images?: File[];
}

export interface ReviewBlogPayload {
  decision: "approved" | "rejected";
  note?: string;
}

export interface UnpublishBlogPayload {
  note?: string;
}

export interface AcceptEditorChangesPayload {
  approvalNote?: string;
}

export interface PublicCommentPayload {
  name: string;
  email: string;
  phone?: string;
  content: string;
  parentComment?: string | null;
}

export interface BlogConsentPayload {
  approved: boolean;
  note?: string;
}

export interface BlogFilterOptions {
  status?: string;
  tag?: string;
  search?: string;
  author?: string;
  page?: number;
  limit?: number;
}

export interface BlogStatsResponse {
  draft: number;
  pending_review: number;
  approved: number;
  published: number;
  rejected?: number;
  deleted?: number;
  total: number;
}

export interface CreatorActivity {
  id: string;
  action: string;
  storyTitle?: string;
  timestamp: string;
}

export interface ActivityLog {
  _id: string;
  user: string | { _id: string; username: string; firstName: string; lastName: string; role: Role };
  action: string;
  resource?: string;
  resourceId?: string;
  details?: string;
  createdAt: string;
}

export interface AuditLogFilterOptions {
  action?: string;
  actor?: string;
  target?: string;
  targetId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Helper: Dynamic Base Route Path ──────────────────────────────────────────

function getBlogBasePath(role?: Role): string {
  switch (role) {
    case "admin":
      return "/api/blogs";
    case "communication_officer":
      return "/api/officer/published";
    case "editor":
    case "media_correspondent":
    case "social_media_content_creator":
    case "principal_investigator":
    default:
      return "/api/blogs";
  }
}

function getTrashBasePath(_role?: Role): string {
  return "/api/blogs/trash";
}

function extractBlogFromResponse(payload: unknown): { message: string; blog: BlogPost } {
  if (!payload || typeof payload !== "object") {
    return { message: "", blog: (null as unknown) as BlogPost };
  }

  const data = payload as Record<string, unknown>;

  if (data.blog && typeof data.blog === "object") {
    return { message: String(data.message || ""), blog: data.blog as BlogPost };
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as Record<string, unknown>;
    if (nested.blog && typeof nested.blog === "object") {
      return { message: String(data.message || ""), blog: nested.blog as BlogPost };
    }
    if (nested._id && nested.title) {
      return { message: String(data.message || ""), blog: nested as unknown as BlogPost };
    }
    if (Array.isArray(nested.docs) && nested.docs[0] && typeof nested.docs[0] === "object") {
      return { message: String(data.message || ""), blog: nested.docs[0] as BlogPost };
    }
  }

  if (data._id && data.title) {
    return { message: String(data.message || ""), blog: data as unknown as BlogPost };
  }

  for (const key of Object.keys(data)) {
    const candidate = data[key];
    if (candidate && typeof candidate === "object" && "_id" in candidate && "title" in candidate) {
      return { message: String(data.message || ""), blog: candidate as BlogPost };
    }
  }

  return { message: String(data.message || ""), blog: (null as unknown) as BlogPost };
}

// ─── Public Endpoints (No Auth Required) ──────────────────────────────────────

export async function getPublicBlogs(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/blogs/public${queryString}`, { auth: false });
}

export async function getPublicBlogBySlug(slug: string): Promise<BlogPost> {
  try {
    return await apiRequest<BlogPost>(`/api/blogs/public/slug/${slug}`, { auth: false });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await apiRequest<BlogPost>(`/api/blogs/public/${slug}`, { auth: false });
    }
    throw err;
  }
}

export async function addPublicBlogComment(slug: string, payload: PublicCommentPayload): Promise<{ message: string; comment: Comment }> {
  return apiRequest<{ message: string; comment: Comment }>(`/api/blogs/public/${slug}/comments`, {
    method: "POST",
    body: payload,
    auth: false,
  });
}

// ─── Comment Moderation API Operations ────────────────────────────────────────

export async function hideBlogComment(blogId: string, commentId: string): Promise<{ message: string; comment: Comment }> {
  return apiRequest<{ message: string; comment: Comment }>(`/api/blogs/${blogId}/comments/${commentId}/hide`, {
    method: "PATCH",
    auth: true,
  });
}

export async function unhideBlogComment(blogId: string, commentId: string): Promise<{ message: string; comment: Comment }> {
  return apiRequest<{ message: string; comment: Comment }>(`/api/blogs/${blogId}/comments/${commentId}/unhide`, {
    method: "PATCH",
    auth: true,
  });
}

export async function deleteBlogComment(blogId: string, commentId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/blogs/${blogId}/comments/${commentId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function respondToWriterConsent(blogId: string, payload: BlogConsentPayload): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/blogs/${blogId}/consent`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });

  return extractBlogFromResponse(res);
}

// ─── Protected CRUD Operations ────────────────────────────────────────────────

export async function getBlogs(role?: Role, params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const basePath = getBlogBasePath(role);
  const query = new URLSearchParams();

  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);
  if (params.tag) query.append("tag", params.tag);
  if (params.author) query.append("author", params.author);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  
  try {
    return await apiRequest<PaginatedResponse<BlogPost>>(`${basePath}${queryString}`, { auth: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await apiRequest<PaginatedResponse<BlogPost>>(`/api/blogs${queryString}`, { auth: true });
    }
    throw err;
  }
}

export async function getBlogById(id: string, role?: Role): Promise<BlogPost> {
  const basePath = getBlogBasePath(role);
  try {
    return await apiRequest<BlogPost>(`${basePath}/${id}`, { auth: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await apiRequest<BlogPost>(`/api/blogs/${id}`, { auth: true });
    }
    throw err;
  }
}

export async function getBlogStats(role?: Role): Promise<BlogStatsResponse> {
  const endpoint = role === "communication_officer" ? "/api/officer/dashboard-stats" : "/api/blogs/stats";
  try {
    return await apiRequest<BlogStatsResponse>(endpoint, { auth: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await apiRequest<BlogStatsResponse>("/api/blogs/stats", { auth: true });
    }
    throw err;
  }
}

export async function createBlog(payload: CreateBlogPayload, _role?: Role): Promise<BlogPost> {
  const endpoint = "/api/blogs";

  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("tag", payload.tag);
  formData.append("excerpt", payload.excerpt);

  if (payload.blocks) {
    formData.append("blocks", JSON.stringify(payload.blocks));
  }
  if (payload.modal) {
    formData.append("modal", JSON.stringify(payload.modal));
  }
  if (payload.socialHandle) {
    formData.append("socialHandle", payload.socialHandle);
  }
  if (payload.organizationLink) {
    formData.append("organizationLink", payload.organizationLink);
  }

  formData.append("img", payload.img);
  if (payload.document) {
    formData.append("document", payload.document);
  }
  if (payload.images && Array.isArray(payload.images)) {
    for (const file of payload.images) {
      try {
        formData.append("images", file, file.name);
      } catch {
        formData.append("images", file as unknown as Blob);
      }
    }
  }

  const res = await apiFormRequest<unknown>(endpoint, {
    method: "POST",
    formData,
    auth: true,
  });

  const normalized = extractBlogFromResponse(res);
  return normalized.blog;
}

export async function updateBlog(id: string, payload: UpdateBlogPayload, _role?: Role): Promise<BlogPost> {
  const endpoint = `/api/blogs/${id}`;

  const formData = new FormData();
  if (payload.title) formData.append("title", payload.title);
  if (payload.tag) formData.append("tag", payload.tag);
  if (payload.excerpt) formData.append("excerpt", payload.excerpt);
  if (payload.blocks) formData.append("blocks", typeof payload.blocks === "string" ? payload.blocks : JSON.stringify(payload.blocks));
  if (payload.modal) formData.append("modal", typeof payload.modal === "string" ? payload.modal : JSON.stringify(payload.modal));
  if (payload.socialHandle) formData.append("socialHandle", payload.socialHandle);
  if (payload.organizationLink) formData.append("organizationLink", payload.organizationLink);

  if (payload.img) formData.append("img", payload.img);
  if (payload.document) formData.append("document", payload.document);
  if (payload.images && Array.isArray(payload.images)) {
    for (const file of payload.images) {
      try {
        formData.append("images", file, file.name);
      } catch {
        formData.append("images", file as unknown as Blob);
      }
    }
  }

  const res = await apiFormRequest<unknown>(endpoint, {
    method: "PUT",
    formData,
    auth: true,
  });

  const normalized = extractBlogFromResponse(res);
  return normalized.blog;
}

export async function deleteBlog(id: string, _role?: Role): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/blogs/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

// ─── Trash Operations ────────────────────────────────────────────────────────

export async function getDeletedBlogs(role?: Role): Promise<BlogPost[] | PaginatedResponse<BlogPost>> {
  return apiRequest<BlogPost[] | PaginatedResponse<BlogPost>>(getTrashBasePath(role), { auth: true });
}

export async function restoreBlog(id: string, _role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/blogs/${id}/restore`, {
    method: "PATCH",
    auth: true,
  });

  return extractBlogFromResponse(res);
}

export async function permanentDeleteBlog(id: string, _role?: Role): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/blogs/${id}/hard-delete`, {
    method: "DELETE",
    auth: true,
  });
}

// ─── Editorial Workflow Operations ───────────────────────────────────────────

export async function submitBlog(id: string, _role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/blogs/${id}/submit`, {
    method: "PATCH",
    auth: true,
  });

  return extractBlogFromResponse(res);
}

export async function reviewBlog(id: string, payload: ReviewBlogPayload, _role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/blogs/${id}/review`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });

  return extractBlogFromResponse(res);
}

export async function approveBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  return reviewBlog(id, { decision: "approved" }, role);
}

export async function rejectBlog(id: string, note?: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  return reviewBlog(id, { decision: "rejected", note }, role);
}

export async function publishBlog(id: string, _role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/blogs/${id}/publish`, {
    method: "PATCH",
    auth: true,
  });

  return extractBlogFromResponse(res);
}

export async function unpublishBlog(id: string, payload?: UnpublishBlogPayload, _role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/blogs/${id}/unpublish`, {
    method: "PATCH",
    auth: true,
    body: payload || {},
  });

  return extractBlogFromResponse(res);
}

// ─── Communication Officer Operations ───────────────────────────────────────

export async function getOfficerPublishedBlogs(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/officer/published${queryString}`, { auth: true });
}

export async function getOfficerPublishedBlogById(id: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/officer/published/${id}`, { auth: true });
}

export async function getArticleComments(articleId: string): Promise<Comment[]> {
  return apiRequest<Comment[]>(`/api/officer/published/${articleId}/comments`, { auth: true });
}

export async function addArticleComment(articleId: string, content: string): Promise<{ message: string; comment: Comment }> {
  return apiRequest<{ message: string; comment: Comment }>(`/api/officer/published/${articleId}/comments`, {
    method: "POST",
    body: { content },
    auth: true,
  });
}

export async function getEditorChanges(id: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/officer/blogs/${id}/editor-changes`, { auth: true });
}

export async function acceptEditorChanges(id: string, payload?: AcceptEditorChangesPayload): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/officer/blogs/${id}/accept-editor-changes`, {
    method: "PATCH",
    body: payload || {},
    auth: true,
  });

  return extractBlogFromResponse(res);
}

export async function getOfficerNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>("/api/officer/notifications", { auth: true });
}

export async function markNotificationRead(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/officer/notifications/${id}/read`, {
    method: "PATCH",
    auth: true,
  });
}

export async function getOfficerActivityLogs(): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>("/api/officer/activity-logs", { auth: true });
}

export async function getOfficerActivityLogById(id: string): Promise<ActivityLog> {
  return apiRequest<ActivityLog>(`/api/officer/activity-logs/${id}`, { auth: true });
}

export async function getAdminAuditLogs(params: AuditLogFilterOptions = {}): Promise<PaginatedResponse<ActivityLog> | ActivityLog[]> {
  const query = new URLSearchParams();
  if (params.action) query.append("action", params.action);
  if (params.actor) query.append("actor", params.actor);
  if (params.target) query.append("target", params.target);
  if (params.targetId) query.append("targetId", params.targetId);
  if (params.from) query.append("from", params.from);
  if (params.to) query.append("to", params.to);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const q = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<ActivityLog> | ActivityLog[]>(`/api/admin/audit-logs${q}`, { auth: true });
}

export async function getAdminAuditLogsByBlog(id: string): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>(`/api/admin/audit-logs/blog/${id}`, { auth: true });
}

export async function getAdminAuditLogsByUser(id: string): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>(`/api/admin/audit-logs/user/${id}`, { auth: true });
}

// ─── Content Creator Operations ────────────────────────────────────────────

export async function getCreatorProfile(): Promise<User> {
  return apiRequest<User>("/api/contributor/profile", { auth: true });
}

export async function getCreatorActivity(): Promise<CreatorActivity[]> {
  return apiRequest<CreatorActivity[]>("/api/contributor/activity", { auth: true });
}

export async function getCreatorPublishedFeed(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost> | BlogPost[]> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/contributor/published${queryString}`, { auth: true });
}

export async function getCreatorPublishedBySlug(slug: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/contributor/published/${slug}`, { auth: true });
}

export interface MarkChangeImplementedPayload {
  changeId?: string;
  implementationNote?: string;
}

export async function markChangeImplemented(id: string, payload?: MarkChangeImplementedPayload, _role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/blogs/${id}/change-implemented`, {
    method: "PATCH",
    auth: true,
    body: payload || {},
  });

  return extractBlogFromResponse(res);
}

// ─── Editor Dedicated Operations ───────────────────────────────────────────

export const editorApi = {
  getBlogStats: async (): Promise<BlogStatsResponse> => {
    try {
      return await apiRequest<BlogStatsResponse>("/api/blogs/stats", { auth: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<BlogStatsResponse>("/api/editor/blogs/stats", { auth: true });
      }
      throw err;
    }
  },

  getReviewQueue: async (params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost> | BlogPost[]> => {
    const query = new URLSearchParams();
    query.append("status", "pending_review");
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    try {
      return await apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/blogs?${query.toString()}`, { auth: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/editor/blogs/review-queue?${query.toString()}`, { auth: true });
      }
      throw err;
    }
  },

  getBlogs: async (params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost> | BlogPost[]> => {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.tag) query.append("tag", params.tag);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : "";

    try {
      return await apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/blogs${queryString}`, { auth: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/editor/blogs${queryString}`, { auth: true });
      }
      throw err;
    }
  },

  getBlogById: async (id: string): Promise<BlogPost> => {
    try {
      return await apiRequest<BlogPost>(`/api/blogs/${id}`, { auth: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return await apiRequest<BlogPost>(`/api/editor/blogs/${id}`, { auth: true });
      }
      throw err;
    }
  },

  createBlog: async (payload: CreateBlogPayload): Promise<BlogPost> => {
    return createBlog(payload, "editor");
  },

  updateBlog: async (id: string, payload: UpdateBlogPayload): Promise<BlogPost> => {
    return updateBlog(id, payload, "editor");
  },

  submitBlog: async (id: string): Promise<{ message: string; blog: BlogPost }> => {
    return submitBlog(id, "editor");
  },

  reviewBlog: async (id: string, payload: ReviewBlogPayload): Promise<{ message: string; blog: BlogPost }> => {
    return reviewBlog(id, payload, "editor");
  },

  unpublishBlog: async (id: string, payload?: UnpublishBlogPayload): Promise<{ message: string; blog: BlogPost }> => {
    return unpublishBlog(id, payload, "editor");
  },

  publishBlog: async (id: string): Promise<{ message: string; blog: BlogPost }> => {
    return publishBlog(id, "editor");
  },
};

// ─── Unified Namespace Exports ────────────────────────────────────────────────

export const officerApi = {
  getPublishedBlogs: getOfficerPublishedBlogs,
  getPublishedBlogById: getOfficerPublishedBlogById,
  getArticleComments,
  addArticleComment,
  hideBlogComment,
  unhideBlogComment,
  deleteBlogComment,
  getEditorChanges,
  acceptEditorChanges,
  getNotifications: getOfficerNotifications,
  markNotificationRead,
  getActivityLogs: getOfficerActivityLogs,
  getActivityLogById: getOfficerActivityLogById,
};

export const blogsApi = {
  getPublicBlogs,
  getPublicBlogBySlug,
  addPublicBlogComment,
  hideBlogComment,
  unhideBlogComment,
  deleteBlogComment,
  respondToWriterConsent,
  getBlogs,
  getBlogById,
  getBlogStats,
  createBlog,
  updateBlog,
  deleteBlog,
  getDeletedBlogs,
  restoreBlog,
  permanentDeleteBlog,
  submitBlog,
  reviewBlog,
  approveBlog,
  rejectBlog,
  publishBlog,
  unpublishBlog,
  getOfficerPublishedBlogs,
  getOfficerPublishedBlogById,
  getArticleComments,
  addArticleComment,
  getEditorChanges,
  acceptEditorChanges,
  getOfficerNotifications,
  markNotificationRead,
  getOfficerActivityLogs,
  getOfficerActivityLogById,
  getAdminAuditLogs,
  getAdminAuditLogsByBlog,
  getAdminAuditLogsByUser,
  getCreatorProfile,
  getCreatorActivity,
  getCreatorPublishedFeed,
  getCreatorPublishedBySlug,
  markChangeImplemented,
};