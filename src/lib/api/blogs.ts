// src/lib/api/blogs.ts

import { apiRequest, apiFormRequest, ApiError } from "./client";
import { base64ToFile } from "@/lib/utils/file";
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
  img: File | string; // Allow File or hosted/base64 URL
  document?: File | string;
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
  img?: File | string | null; // null explicitly clears an existing cover image
  document?: File | string;
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

export interface InternalNotePayload {
  content: string;
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

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName?: string;
  folder: string;
}

// ─── Helper: Direct Cloudinary Signature & Parallel Upload ───────────────────

/**
 * POST /api/upload/image — uploads one image through the backend (server-side Cloudinary upload).
 * Prefer uploadDirectToCloudinary for large files; this route is for small images.
 */
export async function uploadImage(file: File): Promise<{ success: boolean; imageUrl: string; publicId: string }> {
  const formData = new FormData();
  formData.append("image", file);
  return apiFormRequest<{ success: boolean; imageUrl: string; publicId: string }>("/api/upload/image", {
    method: "POST",
    formData,
    auth: true,
  });
}

/**
 * Fetches an upload signature from the backend and uploads a file directly
 * from the browser to Cloudinary (bypassing the Render server).
 */
export async function uploadDirectToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  // 1. Get cryptographic signature from backend
  const sig = await apiRequest<CloudinarySignatureResponse>("/api/upload/signature", { auth: true });
  const cloudName = sig.cloudName?.trim() || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

  if (!cloudName) {
    throw new ApiError("Cloudinary cloud name is missing. Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME for the frontend build.", 500);
  }

  // 2. Prepare Direct Cloudinary FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", sig.timestamp.toString());
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  // 3. Upload directly to Cloudinary
  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!cloudRes.ok) {
    throw new ApiError("Failed to upload image directly to Cloudinary", cloudRes.status);
  }

  const data = await cloudRes.json();
  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
  };
}

// ─── Dynamic Base Route Path Helpers ──────────────────────────────────────────

function getBlogBasePath(_role?: Role): string {
  return "/api/blogs";
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

// ─── 1. PUBLIC AUDIENCE ENDPOINTS (Audience Comments on Published Articles) ─────

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
export async function getPublicComments(slug: string): Promise<Comment[]> {
  try {
    const blog = await getPublicBlogBySlug(slug);
    return blog?.comments || [];
  } catch {
    return apiRequest<Comment[]>(`/api/blogs/public/${slug}/comments`, { auth: false });
  }
}


export async function addPublicComment(slug: string, payload: PublicCommentPayload): Promise<{ message: string; comment: Comment }> {
  return apiRequest<{ message: string; comment: Comment }>(`/api/blogs/public/${slug}/comments`, {
    method: "POST",
    body: payload,
    auth: false,
  });
}


export async function addPublicBlogComment(slug: string, payload: PublicCommentPayload): Promise<{ message: string; comment: Comment }> {
  return addPublicComment(slug, payload);
}


export async function addComment(
  blogId: string,
  commentData: { content: string; name?: string; email?: string }
): Promise<Comment | { message: string; comment: Comment }> {
  return apiRequest<Comment | { message: string; comment: Comment }>(`/api/blogs/${blogId}/comments`, {
    method: "POST",
    body: commentData,
    auth: true,
  });
}

/** Fetch internal review notes for officers/editors */
export async function getArticleComments(articleId: string): Promise<Comment[]> {
  return apiRequest<Comment[]>(`/api/officer/published/${articleId}/comments`, { auth: true });
}

/** Post officer review comment for revision requests */
export async function addArticleComment(articleId: string, content: string): Promise<{ message: string; comment: Comment }> {
  return apiRequest<{ message: string; comment: Comment }>(`/api/officer/published/${articleId}/comments`, {
    method: "POST",
    body: { content },
    auth: true,
  });
}

// ─── Comment Moderation Operations ───────────────────────────────────────────

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
  const endpoint = role === "communication_officer" ? "/api/officer/blogs/stats" : "/api/blogs/stats";
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
  // 🟢 1. MULTI-THREADED PARALLEL UPLOAD PIPELINE
  const uploadPromises: Promise<{ url: string; publicId: string }>[] = [];

  // Cover Image File Resolution
  let coverFileToUpload: File | null = null;
  let coverUrl = "";
  let coverPublicId: string | undefined = undefined;

  if (payload.img instanceof File) {
    coverFileToUpload = payload.img;
  } else if (typeof payload.img === "string" && payload.img.startsWith("data:image")) {
    coverFileToUpload = base64ToFile(payload.img, `cover-${Date.now()}.jpg`);
  } else if (typeof payload.img === "string" && payload.img.trim()) {
    coverUrl = payload.img.trim();
  }

  let coverPromiseIdx = -1;
  if (coverFileToUpload) {
    coverPromiseIdx = uploadPromises.length;
    uploadPromises.push(uploadDirectToCloudinary(coverFileToUpload));
  }

  // Document File Resolution
  let docFileToUpload: File | null = null;
  if (payload.document instanceof File) {
    docFileToUpload = payload.document;
  } else if (typeof payload.document === "string" && payload.document.startsWith("data:")) {
    docFileToUpload = base64ToFile(payload.document, `doc-${Date.now()}.pdf`);
  }

  let docPromiseIdx = -1;
  if (docFileToUpload) {
    docPromiseIdx = uploadPromises.length;
    uploadPromises.push(uploadDirectToCloudinary(docFileToUpload));
  }

  // Section Block Images Resolution
  const blockImageIndices: { blockIdx: number; promiseIdx: number }[] = [];
  (payload.blocks || []).forEach((block, idx) => {
    let fileToUpload: File | null = null;

    if (block.type === "image" || block.type === "hero") {
      if ((block as any).rawFile instanceof File) {
        fileToUpload = (block as any).rawFile;
      } else if (typeof block.src === "string" && block.src.startsWith("data:image")) {
        fileToUpload = base64ToFile(block.src, `inline-${Date.now()}-${idx}.jpg`);
      }
    }

    if (fileToUpload) {
      blockImageIndices.push({
        blockIdx: idx,
        promiseIdx: uploadPromises.length,
      });
      uploadPromises.push(uploadDirectToCloudinary(fileToUpload));
    }
  });

  // 🟢 2. EXECUTE ALL UPLOADS CONCURRENTLY
  const uploadResults = await Promise.all(uploadPromises);

  // Map Cover Upload
  if (coverPromiseIdx !== -1 && uploadResults[coverPromiseIdx]) {
    coverUrl = uploadResults[coverPromiseIdx].url;
    coverPublicId = uploadResults[coverPromiseIdx].publicId;
  }

  if (!coverUrl) {
    throw new ApiError("A cover image is required before submitting your story.", 400);
  }

  // Map Document Upload
  let documentData: { url: string; publicId: string } | undefined;
  if (docPromiseIdx !== -1 && uploadResults[docPromiseIdx]) {
    documentData = uploadResults[docPromiseIdx];
  } else if (typeof payload.document === "string" && !payload.document.startsWith("data:")) {
    documentData = { url: payload.document, publicId: "" };
  }

  // Map Inline Block Uploads
  const processedBlocks = (payload.blocks || []).map((block, idx) => {
    const matchedUpload = blockImageIndices.find((b) => b.blockIdx === idx);
    if (matchedUpload && uploadResults[matchedUpload.promiseIdx]) {
      const result = uploadResults[matchedUpload.promiseIdx];
      return {
        ...block,
        src: result.url,
        source: result.publicId,
      };
    }
    return block;
  });

  // 🟢 3. SUBMIT INSTANT (<100ms) JSON PAYLOAD
  const res = await apiRequest<unknown>("/api/blogs", {
    method: "POST",
    auth: true,
    body: {
      title: payload.title,
      tag: payload.tag,
      excerpt: payload.excerpt,
      blocks: processedBlocks,
      modal: payload.modal,
      socialHandle: payload.socialHandle,
      organizationLink: payload.organizationLink,
      img: coverUrl,
      ...(coverPublicId && { imgPublicId: coverPublicId }),
      ...(documentData && {
        documentUrl: documentData.url,
        ...(documentData.publicId && { documentPublicId: documentData.publicId }),
        documentName: payload.document instanceof File ? payload.document.name : undefined,
      }),
    },
  });

  const normalized = extractBlogFromResponse(res);
  return normalized.blog;
}

export async function updateBlog(id: string, payload: UpdateBlogPayload, _role?: Role): Promise<BlogPost> {
  const uploadPromises: Promise<{ url: string; publicId: string }>[] = [];

  // Cover Image
  let coverFileToUpload: File | null = null;
  let coverImageUrl: string | undefined;
  let coverImagePublicId: string | undefined;

  if (payload.img instanceof File) {
    coverFileToUpload = payload.img;
  } else if (typeof payload.img === "string" && payload.img.startsWith("data:image")) {
    coverFileToUpload = base64ToFile(payload.img, `cover-${Date.now()}.jpg`);
  } else if (typeof payload.img === "string") {
    coverImageUrl = payload.img;
  }

  let coverPromiseIdx = -1;
  if (coverFileToUpload) {
    coverPromiseIdx = uploadPromises.length;
    uploadPromises.push(uploadDirectToCloudinary(coverFileToUpload));
  }

  // Document
  let docFileToUpload: File | null = null;
  if (payload.document instanceof File) {
    docFileToUpload = payload.document;
  } else if (typeof payload.document === "string" && payload.document.startsWith("data:")) {
    docFileToUpload = base64ToFile(payload.document, `doc-${Date.now()}.pdf`);
  }

  let docPromiseIdx = -1;
  if (docFileToUpload) {
    docPromiseIdx = uploadPromises.length;
    uploadPromises.push(uploadDirectToCloudinary(docFileToUpload));
  }

  // Blocks
  const blockImageIndices: { blockIdx: number; promiseIdx: number }[] = [];
  if (payload.blocks && Array.isArray(payload.blocks)) {
    payload.blocks.forEach((block, idx) => {
      let fileToUpload: File | null = null;

      if (block.type === "image" || block.type === "hero") {
        if ((block as any).rawFile instanceof File) {
          fileToUpload = (block as any).rawFile;
        } else if (typeof block.src === "string" && block.src.startsWith("data:image")) {
          fileToUpload = base64ToFile(block.src, `inline-${crypto.randomUUID()}.jpg`);
        }
      }

      if (fileToUpload) {
        blockImageIndices.push({
          blockIdx: idx,
          promiseIdx: uploadPromises.length,
        });
        uploadPromises.push(uploadDirectToCloudinary(fileToUpload));
      }
    });
  }

  // Execute Parallel Uploads
  const uploadResults = await Promise.all(uploadPromises);

  if (coverPromiseIdx !== -1 && uploadResults[coverPromiseIdx]) {
    coverImageUrl = uploadResults[coverPromiseIdx].url;
    coverImagePublicId = uploadResults[coverPromiseIdx].publicId;
  }

  let documentData: { url: string; publicId: string } | undefined;
  if (docPromiseIdx !== -1 && uploadResults[docPromiseIdx]) {
    documentData = uploadResults[docPromiseIdx];
  } else if (typeof payload.document === "string" && !payload.document.startsWith("data:")) {
    documentData = { url: payload.document, publicId: "" };
  }

  let processedBlocks = payload.blocks;
  if (payload.blocks && Array.isArray(payload.blocks)) {
    processedBlocks = payload.blocks.map((block, idx) => {
      const matchedUpload = blockImageIndices.find((b) => b.blockIdx === idx);
      if (matchedUpload && uploadResults[matchedUpload.promiseIdx]) {
        const result = uploadResults[matchedUpload.promiseIdx];
        return {
          ...block,
          src: result.url,
          source: result.publicId,
        };
      }
      return block;
    });
  }

  const res = await apiRequest<unknown>(`/api/blogs/${id}`, {
    method: "PUT",
    auth: true,
    body: {
      ...(payload.title && { title: payload.title }),
      ...(payload.tag && { tag: payload.tag }),
      ...(payload.excerpt && { excerpt: payload.excerpt }),
      ...(processedBlocks && { blocks: processedBlocks }),
      ...(payload.modal && { modal: payload.modal }),
      ...(payload.socialHandle && { socialHandle: payload.socialHandle }),
      ...(payload.organizationLink && { organizationLink: payload.organizationLink }),
      ...(payload.img !== undefined && {
        img: coverImageUrl || null,
        ...(payload.img === null
          ? { imgPublicId: null }
          : coverImagePublicId && { imgPublicId: coverImagePublicId }),
      }),
      ...(documentData && {
        documentUrl: documentData.url,
        ...(documentData.publicId && { documentPublicId: documentData.publicId }),
        documentName: payload.document instanceof File ? payload.document.name : undefined,
      }),
    },
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

export async function getOfficerPendingBlogs(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost> | BlogPost[]> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  
  try {
    return await apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/officer/pending${queryString}`, { auth: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await apiRequest<PaginatedResponse<BlogPost> | BlogPost[]>(`/api/blogs?status=pending_review${queryString}`, { auth: true });
    }
    throw err;
  }
}

export async function getOfficerPublishedBlogs(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.tag) query.append("tag", params.tag);
  if (params.search) query.append("search", params.search);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/officer/published${queryString}`, { auth: false });
}

export async function getOfficerPublishedBlogById(id: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/officer/published/${id}`, { auth: true });
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

// ─── Writer Submissions, Contributor Blogs & Editor Revisions ─────────────────

export interface EditorRevisionChange {
  field: string;
  before?: unknown;
  after?: unknown;
}

export interface EditorRevisionProposal {
  version?: number;
  status?: "pending" | "accepted" | "rejected" | "withdrawn" | string;
  editor?: { _id?: string; firstName?: string; lastName?: string; username?: string; role?: string };
  proposedAt?: string;
  decidedAt?: string;
  decisionNote?: string;
  changes?: EditorRevisionChange[];
}

/** Response of GET /api/editor/blogs/:id/revisions and /api/officer/blogs/:id/revisions */
export interface EditorRevisionHistory {
  status: string;
  publishConsentStatus?: string;
  current?: Record<string, unknown>;
  changesSinceLastProposal?: EditorRevisionChange[];
  proposals: EditorRevisionProposal[];
}

/** Response of GET /api/contributor/blogs/:id/editor-revision (the writer's view of the latest proposal) */
export interface WriterEditorRevision {
  status: string;
  publishConsentStatus?: string;
  pending: boolean;
  version?: number;
  recordStatus?: string;
  editor?: EditorRevisionProposal["editor"];
  proposedAt?: string;
  decidedAt?: string;
  decisionNote?: string;
  baseline?: Record<string, unknown>;
  proposal?: Record<string, unknown>;
  changes?: EditorRevisionChange[];
}

/** Writer: track the status of blogs they wrote or submitted, including rejection notes */
export async function getMySubmissions(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/blogs/my-submissions${queryString}`, { auth: true });
}

/** Contributor: paginated list of their own blogs */
export async function getContributorBlogs(params: BlogFilterOptions = {}): Promise<PaginatedResponse<BlogPost>> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PaginatedResponse<BlogPost>>(`/api/contributor/my-blogs${queryString}`, { auth: true });
}

/** Contributor: a single blog they own */
export async function getContributorBlogById(id: string): Promise<BlogPost> {
  return apiRequest<BlogPost>(`/api/contributor/my-blogs/${id}`, { auth: true });
}

/** Writer: the latest editor revision proposed on their blog */
export async function getWriterEditorRevision(id: string): Promise<WriterEditorRevision> {
  return apiRequest<WriterEditorRevision>(`/api/contributor/blogs/${id}/editor-revision`, { auth: true });
}

/** Editor, Officer or Admin: full editor revision history of a blog */
export async function getEditorRevisionHistory(id: string, role?: Role): Promise<EditorRevisionHistory> {
  const basePath = role === "communication_officer" ? "/api/officer" : "/api/editor";
  return apiRequest<EditorRevisionHistory>(`${basePath}/blogs/${id}/revisions`, { auth: true });
}

/** Editor: withdraw a pending editor proposal before the writer decides */
export async function withdrawEditorProposal(id: string): Promise<{ message: string; blog: BlogPost }> {
  const res = await apiRequest<unknown>(`/api/editor/blogs/${id}/proposal`, {
    method: "DELETE",
    auth: true,
  });

  return extractBlogFromResponse(res);
}

// ─── Editor Dedicated Operations ───────────────────────────────────────────

export const editorApi = {
  withdrawEditorProposal,
  getRevisionHistory: getEditorRevisionHistory,

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

// ─── Officer Dedicated Operations ──────────────────────────────────────────

export const officerApi = {
  getPendingBlogs: getOfficerPendingBlogs,
  getPublishedBlogs: getOfficerPublishedBlogs,
  getPublishedBlogById: getOfficerPublishedBlogById,
  getArticleComments,
  addArticleComment,
  hideBlogComment,
  unhideBlogComment,
  deleteBlogComment,
  getEditorChanges,
  acceptEditorChanges,
  getRevisionHistory: (id: string) => getEditorRevisionHistory(id, "communication_officer"),
  getNotifications: getOfficerNotifications,
  markNotificationRead,
  getActivityLogs: getOfficerActivityLogs,
  getActivityLogById: getOfficerActivityLogById,
};

// ─── Unified Namespace Exports ────────────────────────────────────────────────

export const blogsApi = {
  // Public Audience Comments
  getPublicBlogs,
  getPublicBlogBySlug,
  getPublicComments,        // 🟢 EXPORTED: Resolves getPublicComments redline
  addPublicComment,         // 🟢 EXPORTED: Resolves addPublicComment redline
  addPublicBlogComment,     // Alias for addPublicComment

  // Internal Editorial Notes & Review Comments
  addComment,
  getArticleComments,
  addArticleComment,

  // Comment Moderation
  hideBlogComment,
  unhideBlogComment,
  deleteBlogComment,

  // Editorial Workflow & Article CRUD
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
  uploadImage,
  getMySubmissions,
  getContributorBlogs,
  getContributorBlogById,
  getWriterEditorRevision,
  getEditorRevisionHistory,
  withdrawEditorProposal,
};