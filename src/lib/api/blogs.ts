import { apiRequest, apiFormRequest } from "./client";
import { BlogPost, BlogBlock, BlogModalMetadata, PaginatedResponse, Role } from "@/types";

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
  deleted?: number;
  total: number;
}

// ─── Helper: Dynamic Base Route Path ──────────────────────────────────────────

function getBlogBasePath(role?: Role): string {
  switch (role) {
    case "admin":
      return "/api/blogs";
    case "communication_officer":
      return "/api/officer/blogs";
    case "editor":
      return "/api/editor/blogs";
    case "broadcast_content_creator":
    case "social_media_content_creator":
      // 🚨 FIX: GET endpoints for contributors use /api/contributor/my-blogs
      return "/api/contributor/my-blogs";
    default:
      return "/api/blogs";
  }
}

// ─── Individual Function Exports ───────────────────────────────────────────────

/**
 * GET /api/blogs/public — Public endpoint for live website feed (No Auth Required)
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

/**
 * GET /api/blogs (or role-specific path) — List dashboard blogs
 */
export async function getBlogs(role?: Role, params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const basePath = getBlogBasePath(role);
  const query = new URLSearchParams();

  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);
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
 * GET /api/blogs/stats — Get count metrics by status
 */
export async function getBlogStats(role?: Role): Promise<BlogStatsResponse> {
  const basePath = getBlogBasePath(role);
  return apiRequest<BlogStatsResponse>(`${basePath}/stats`, { auth: true });
}

/**
 * POST /api/blogs — Create new blog with multipart FormData
 */
export async function createBlog(payload: CreateBlogPayload, role?: Role): Promise<BlogPost> {
  const isContributor = role === "broadcast_content_creator" || role === "social_media_content_creator";
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

  return apiFormRequest<BlogPost>(endpoint, {
    method: "POST",
    formData,
    auth: true,
  });
}

/**
 * PUT /api/blogs/:id — Update existing blog
 */
export async function updateBlog(id: string, payload: UpdateBlogPayload, role?: Role): Promise<BlogPost> {
  const isContributor = role === "broadcast_content_creator" || role === "social_media_content_creator";
  const endpoint = isContributor ? `/api/contributor/blogs/${id}` : `${getBlogBasePath(role)}/${id}`;

  const formData = new FormData();
  if (payload.title) formData.append("title", payload.title);
  if (payload.tag) formData.append("tag", payload.tag);
  if (payload.excerpt) formData.append("excerpt", payload.excerpt);
  if (payload.blocks) formData.append("blocks", JSON.stringify(payload.blocks));
  if (payload.modal) formData.append("modal", JSON.stringify(payload.modal));
  if (payload.socialHandle) formData.append("socialHandle", payload.socialHandle);
  if (payload.organizationLink) formData.append("organizationLink", payload.organizationLink);

  if (payload.img) formData.append("img", payload.img);
  if (payload.document) formData.append("document", payload.document);

  return apiFormRequest<BlogPost>(endpoint, {
    method: "PUT",
    formData,
    auth: true,
  });
}

/**
 * DELETE /api/blogs/:id — Soft-delete blog
 */
export async function deleteBlog(id: string, role?: Role): Promise<{ message: string }> {
  const isContributor = role === "broadcast_content_creator" || role === "social_media_content_creator";
  const endpoint = isContributor ? `/api/contributor/blogs/${id}` : `${getBlogBasePath(role)}/${id}`;

  return apiRequest<{ message: string }>(endpoint, {
    method: "DELETE",
    auth: true,
  });
}

// ─── Workflow Operations ───────────────────────────────────────────────────────

/**
 * PATCH /api/blogs/:id/submit — Submit draft for staff review
 */
export async function submitBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const isContributor = role === "broadcast_content_creator" || role === "social_media_content_creator";
  const endpoint = isContributor ? `/api/contributor/blogs/${id}/submit` : `${getBlogBasePath(role)}/${id}/submit`;

  return apiRequest<{ message: string; blog: BlogPost }>(endpoint, {
    method: "PATCH",
    auth: true,
  });
}

/**
 * PATCH /api/blogs/:id/review — Approve or reject pending blog
 */
export async function reviewBlog(id: string, payload: ReviewBlogPayload, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const basePath = getBlogBasePath(role);
  return apiRequest<{ message: string; blog: BlogPost }>(`${basePath}/${id}/review`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });
}

/**
 * Helper alias to approve a blog post
 */
export async function approveBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  return reviewBlog(id, { decision: "approved" }, role);
}

/**
 * Helper alias to reject a blog post with an optional note
 */
export async function rejectBlog(id: string, note?: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  return reviewBlog(id, { decision: "rejected", note }, role);
}

/**
 * PATCH /api/blogs/:id/publish — Publish approved blog to live site (Admin & Officer)
 */
export async function publishBlog(id: string, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const basePath = getBlogBasePath(role);
  return apiRequest<{ message: string; blog: BlogPost }>(`${basePath}/${id}/publish`, {
    method: "PATCH",
    auth: true,
  });
}

/**
 * PATCH /api/blogs/:id/unpublish — Unpublish live blog back to approved state
 */
export async function unpublishBlog(id: string, payload?: UnpublishBlogPayload, role?: Role): Promise<{ message: string; blog: BlogPost }> {
  const basePath = getBlogBasePath(role);
  return apiRequest<{ message: string; blog: BlogPost }>(`${basePath}/${id}/unpublish`, {
    method: "PATCH",
    auth: true,
    body: payload || {},
  });
}

// ─── Unified Namespace Export Object ──────────────────────────────────────────

export const blogsApi = {
  getPublicBlogs,
  getPublicBlogBySlug,
  getBlogs,
  getBlogById,
  getBlogStats,
  createBlog,
  updateBlog,
  deleteBlog,
  submitBlog,
  reviewBlog,
  approveBlog,
  rejectBlog,
  publishBlog,
  unpublishBlog,
};