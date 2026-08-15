import { apiRequest, apiFormRequest, ApiError } from "./client";
import { 
  BlogPost, 
  BlogBlock, 
  BlogModalMetadata, 
  PaginatedResponse, 
  Role, 
  User, 
  Comment, 
  Notification 
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

// Admin Audit Logs filter options
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
      return "/api/editor/blogs";
    case "media_correspondent":
    case "social_media_content_creator":
    case "principal_investigator":
      return "/api/contributor/my-blogs";
    default:
      return "/api/blogs";
  }
}

function getTrashBasePath(role?: Role): string {
  return "/api/blogs/trash";
}

// Helper to normalize backend responses that may wrap the blog
// in different fields (e.g. { message, blog }, { message, data: { blog } }, or the blog directly).
function extractBlogFromResponse(payload: any): { message: string; blog: BlogPost } {
  if (!payload) {
    return { message: "", blog: (null as unknown) as BlogPost };
  }

  // Common shapes prioritized
  if (payload.blog && typeof payload.blog === "object") {
    return { message: payload.message || "", blog: payload.blog };
  }

  if (payload.data && payload.data.blog && typeof payload.data.blog === "object") {
    return { message: payload.message || "", blog: payload.data.blog };
  }

  // Some endpoints return { data: <blog[]> } or { data: <blog> }
  if (payload.data && typeof payload.data === "object") {
    // If data looks like a blog (has _id and title), treat it as the blog
    if (payload.data._id && payload.data.title) {
      return { message: payload.message || "", blog: payload.data };
    }
    // If data.docs or data[0] exists, return first doc as blog
    if (Array.isArray(payload.data.docs) && payload.data.docs[0]) {
      return { message: payload.message || "", blog: payload.data.docs[0] };
    }
  }

  // If the payload itself looks like a BlogPost, return it
  if (payload._id && payload.title) {
    return { message: payload.message || "", blog: payload };
  }

  // Last-resort: search nested keys for a blog-like object
  for (const key of Object.keys(payload)) {
    const candidate = payload[key];
    if (candidate && typeof candidate === "object" && candidate._id && candidate.title) {
      return { message: payload.message || "", blog: candidate };
    }
  }

  // Fallback: return empty blog placeholder (caller should handle nulls)
  return { message: payload.message || "", blog: (null as unknown) as BlogPost };
}

function isContributorRole(role?: Role): boolean {
  return (
    role === "media_correspondent" ||
    role === "social_media_content_creator" ||
    role === "principal_investigator"
  );
}

// ─── Public Endpoints (No Auth Required) ──────────────────────────────────────

/**
 * GET /api/blogs/public — Live website feed
 */
export async function getPublicBlogs(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/blogs/public${queryString}`);
}

/**
 * GET /api/blogs/public/:slug — Single public post by slug
 */
export async function getPublicBlogBySlug(slug: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/blogs/public/${slug}`);
}

// ─── Protected CRUD Operations ────────────────────────────────────────────────

/**
 * GET /api/blogs (or role-specific path) — List dashboard blogs
 */
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
  return apiRequest<PaginatedResponse<BlogPost>>(`${basePath}${queryString}`, { auth: true });
}

/**
 * GET /api/blogs/:id — Fetch single blog by ID
 */
export async function getBlogById(id: string, role?: Role): Promise<BlogPost> {
  const basePath = getBlogBasePath(role);
  return apiRequest<BlogPost>(`${basePath}/${id}`, { auth: true });
}

/**
 * GET /api/blogs/stats or /api/officer/dashboard-stats — Count metrics by status
 */
export async function getBlogStats(role?: Role): Promise<BlogStatsResponse> {
  const endpoint = role === "communication_officer" ? "/api/officer/dashboard-stats" : `${getBlogBasePath(role)}/stats`;
  return apiRequest<BlogStatsResponse>(endpoint, { auth: true });
}

/**
 * POST /api/blogs — Create new blog with multipart FormData
 */
export async function createBlog(payload: CreateBlogPayload, role?: Role): Promise<BlogPost> {
  const isContributor = isContributorRole(role);
  const endpoint = isContributor ? "/api/contributor/blogs" : getBlogBasePath(role);

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

  const res = await apiFormRequest<any>(endpoint, {
    method: "POST",
    formData,
    auth: true,
  });

  // Some backends return { message, blog } while others return the blog directly
  const normalized = extractBlogFromResponse(res);
  return normalized.blog;
}

/**
 * PUT /api/blogs/:id — Update existing blog
 */
export async function updateBlog(id: string, payload: UpdateBlogPayload, role?: Role): Promise<BlogPost> {
  const isContributor = isContributorRole(role);
  const endpoint = isContributor ? `/api/contributor/blogs/${id}` : `${getBlogBasePath(role)}/${id}`;

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

  const res = await apiFormRequest<any>(endpoint, {
    method: "PUT",
    formData,
    auth: true,
  });

  const normalized = extractBlogFromResponse(res);
  return normalized.blog;
}

/**
 * DELETE /api/blogs/:id — Soft-delete blog
 */
export async function deleteBlog(id: string, role?: Role): Promise<{ message: string }> {
  const isContributor = isContributorRole(role);
  const endpoint = isContributor ? `/api/contributor/blogs/${id}` : `${getBlogBasePath(role)}/${id}`;

  return apiRequest<{ message: string }>(endpoint, {
    method: "DELETE",
    auth: true,
  });
}

// ─── Trash & Permanent Wipe Operations ───────────────────────────────────────

/**
 * GET /api/blogs/trash — Fetch soft-deleted posts
 */
export async function getDeletedBlogs(role?: Role): Promise<BlogPost[] | PaginatedResponse<BlogPost>> {
  const endpoint = getTrashBasePath(role);
  return apiRequest<BlogPost[] | PaginatedResponse<BlogPost>>(endpoint, { auth: true });
}

/**
 * PATCH /api/blogs/:id/restore — Restore a soft-deleted blog
 */
export async function restoreBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<any>(`/api/blogs/${id}/restore`, {
    method: "PATCH",
    auth: true,
  });

  return extractBlogFromResponse(res);
}

/**
 * DELETE /api/blogs/:id/hard-delete — Destroy blog & Cloudinary assets
 */
export async function permanentDeleteBlog(id: string, role?: Role): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/blogs/${id}/hard-delete`, {
    method: "DELETE",
    auth: true,
  });
}

// ─── Editorial Workflow Operations ───────────────────────────────────────────

/**
 * PATCH /api/blogs/:id/submit — Submit draft for review
 */
export async function submitBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const isContributor = isContributorRole(role);
  const endpoint = isContributor ? `/api/contributor/blogs/${id}/submit` : `${getBlogBasePath(role)}/${id}/submit`;

  const res = await apiRequest<any>(endpoint, {
    method: "PATCH",
    auth: true,
  });

  return extractBlogFromResponse(res);
}

/**
 * PATCH /api/blogs/:id/review — Review (Approve or Reject)
 */
export async function reviewBlog(id: string, payload: ReviewBlogPayload, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const basePath = getBlogBasePath(role);
  const res = await apiRequest<any>(`${basePath}/${id}/review`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });

  return extractBlogFromResponse(res);
}

/**
 * Helper: Approve a blog post
 */
export async function approveBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  return reviewBlog(id, { decision: "approved" }, role);
}

/**
 * Helper: Reject a blog post with revision notes
 */
export async function rejectBlog(id: string, note?: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  return reviewBlog(id, { decision: "rejected", note }, role);
}

/**
 * PATCH /api/blogs/:id/publish — Publish approved blog to live feed (Admin & Officer)
 */
export async function publishBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const basePath = getBlogBasePath(role);
  const endpoint = `${basePath}/${id}/publish`;

  try {
    const res = await apiRequest<any>(endpoint, {
      method: "PATCH",
      auth: true,
    });

    return extractBlogFromResponse(res);
  } catch (err: unknown) {
    // If role-specific publish endpoint is not found (404), try the generic admin publish endpoint.
    if (err instanceof ApiError && err.status === 404) {
      const adminFallback = `/api/blogs/${id}/publish`;
      const res = await apiRequest<any>(adminFallback, {
        method: "PATCH",
        auth: true,
      });

      return extractBlogFromResponse(res);
    }
    throw err;
  }
}

/**
 * PATCH /api/blogs/:id/unpublish — Return published blog back to queue with optional note
 */
export async function unpublishBlog(id: string, payload?: UnpublishBlogPayload, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const basePath = getBlogBasePath(role);
  const res = await apiRequest<any>(`${basePath}/${id}/unpublish`, {
    method: "PATCH",
    auth: true,
    body: payload || {},
  });

  return extractBlogFromResponse(res);
}

// ─── Communication Officer Dedicated Operations ───────────────────────────────

/**
 * GET /api/officer/published — List published articles for Communication Officers
 */
export async function getOfficerPublishedBlogs(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/officer/published${queryString}`, { auth: true });
}

/**
 * GET /api/officer/published/:id — Detail of a published article
 */
export async function getOfficerPublishedBlogById(id: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/officer/published/${id}`, { auth: true });
}

/**
 * GET /api/officer/published/:id/comments — Fetch comments on a published article
 */
export async function getArticleComments(articleId: string): Promise<Comment[]> {
  return apiRequest<Comment[]>(`/api/officer/published/${articleId}/comments`, { auth: true });
}

/**
 * POST /api/officer/published/:id/comments — Post a comment on a published article
 */
export async function addArticleComment(articleId: string, content: string): Promise<{ message: string; comment: Comment }> {
  return apiRequest<{ message: string; comment: Comment }>(`/api/officer/published/${articleId}/comments`, {
    method: "POST",
    body: { content },
    auth: true,
  });
}

/**
 * GET /api/officer/blogs/:id/editor-changes — Inspect edits made by the Editor
 */
export async function getEditorChanges(id: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/officer/blogs/${id}/editor-changes`, { auth: true });
}

/**
 * PATCH /api/officer/blogs/:id/accept-editor-changes — Accept changes submitted by the Editor
 */
export async function acceptEditorChanges(id: string, payload?: AcceptEditorChangesPayload): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<any>(`/api/officer/blogs/${id}/accept-editor-changes`, {
    method: "PATCH",
    body: payload || {},
    auth: true,
  });

  return extractBlogFromResponse(res);
}

/**
 * GET /api/officer/notifications — Fetch Officer notifications
 */
export async function getOfficerNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>("/api/officer/notifications", { auth: true });
}

/**
 * PATCH /api/officer/notifications/:id/read — Mark notification as read
 */
export async function markNotificationRead(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/officer/notifications/${id}/read`, {
    method: "PATCH",
    auth: true,
  });
}

/**
 * GET /api/officer/activity-logs — Fetch Officer audit history log
 */
export async function getOfficerActivityLogs(): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>("/api/officer/activity-logs", { auth: true });
}

/**
 * GET /api/officer/activity-logs/:id — Fetch detail of a single activity log entry
 */
export async function getOfficerActivityLogById(id: string): Promise<ActivityLog> {
  return apiRequest<ActivityLog>(`/api/officer/activity-logs/${id}`, { auth: true });
}

/**
 * GET /api/admin/audit-logs — Fetch admin audit logs with filters
 */
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

/**
 * GET /api/admin/audit-logs/blog/:id — Full change history for a specific blog
 */
export async function getAdminAuditLogsByBlog(id: string): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>(`/api/admin/audit-logs/blog/${id}`, { auth: true });
}

/**
 * GET /api/admin/audit-logs/user/:id — Full audit history for a specific user
 */
export async function getAdminAuditLogsByUser(id: string): Promise<ActivityLog[]> {
  return apiRequest<ActivityLog[]>(`/api/admin/audit-logs/user/${id}`, { auth: true });
}

// ─── Content Creator Dedicated Operations ────────────────────────────────────

/**
 * GET /api/contributor/profile — Creator personal profile
 */
export async function getCreatorProfile(): Promise<User> {
  return apiRequest<User>("/api/contributor/profile", { auth: true });
}

/**
 * GET /api/contributor/activity — Creator studio activity feed
 */
export async function getCreatorActivity(): Promise<CreatorActivity[]> {
  return apiRequest<CreatorActivity[]>("/api/contributor/activity", { auth: true });
}

/**
 * GET /api/contributor/published — Read-only published feed for creators
 */
export async function getCreatorPublishedFeed(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost> | BlogPost[]> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/contributor/published${queryString}`, { auth: true });
}

/**
 * GET /api/contributor/published/:slug — Published blog post by slug for creators
 */
export async function getCreatorPublishedBySlug(slug: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/contributor/published/${slug}`, { auth: true });
}

/**
 * PATCH /api/contributor/blogs/:id/change-implemented — Mark a change request implemented
 */
export interface MarkChangeImplementedPayload {
  changeId?: string;
  implementationNote?: string;
}

export async function markChangeImplemented(id: string, payload?: MarkChangeImplementedPayload, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const isContributor = isContributorRole(role);
  const endpoint = isContributor ? `/api/contributor/blogs/${id}/change-implemented` : `${getBlogBasePath(role)}/${id}/change-implemented`;

  const res = await apiRequest<any>(endpoint, {
    method: "PATCH",
    auth: true,
    body: payload || {},
  });

  return extractBlogFromResponse(res);
}

// ─── Communication Editor Dedicated Operations (Swagger Aligned) ─────────────

export const editorApi = {
  // GET /api/editor/blogs/stats
  getBlogStats: async (): Promise<BlogStatsResponse> => {
    return apiRequest<BlogStatsResponse>("/api/editor/blogs/stats", { auth: true });
  },

  // GET /api/editor/blogs/review-queue
  getReviewQueue: async (params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost> | BlogPost[]> => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/editor/blogs/review-queue${queryString}`, { auth: true });
  },

  // GET /api/editor/blogs
  getBlogs: async (params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost> | BlogPost[]> => {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.tag) query.append("tag", params.tag);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/editor/blogs${queryString}`, { auth: true });
  },

  // GET /api/editor/blogs/:id
  getBlogById: async (id: string): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/api/editor/blogs/${id}`, { auth: true });
  },

  // POST /api/editor/blogs
  createBlog: async (payload: CreateBlogPayload): Promise<BlogPost> => {
    return createBlog(payload, "editor");
  },

  // PUT /api/editor/blogs/:id
  updateBlog: async (id: string, payload: UpdateBlogPayload): Promise<BlogPost> => {
    return updateBlog(id, payload, "editor");
  },

  // PATCH /api/editor/blogs/:id/submit
  submitBlog: async (id: string): Promise<{ message: string; blog: BlogPost }> => {
    return submitBlog(id, "editor");
  },

  // PATCH /api/editor/blogs/:id/review
  reviewBlog: async (id: string, payload: ReviewBlogPayload): Promise<{ message: string; blog: BlogPost }> => {
    return reviewBlog(id, payload, "editor");
  },

  // PATCH /api/editor/blogs/:id/unpublish
  unpublishBlog: async (id: string, payload?: UnpublishBlogPayload): Promise<{ message: string; blog: BlogPost }> => {
    return unpublishBlog(id, payload, "editor");
  },
  // PATCH /api/editor/blogs/:id/publish
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
  // Officer methods
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
  // Admin audit methods
  getAdminAuditLogs,
  getAdminAuditLogsByBlog,
  getAdminAuditLogsByUser,
  // Creator methods
  getCreatorProfile,
  getCreatorActivity,
  getCreatorPublishedFeed,
  getCreatorPublishedBySlug,
  markChangeImplemented,
};