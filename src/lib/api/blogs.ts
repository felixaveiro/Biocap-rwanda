import { apiRequest } from "./client";

export interface BlogSession {
  role: string;
  name: string;
  summary: string;
}

export interface BlogModal {
  date: string;
  organizer: string;
  partners: string;
  intro: string;
  objectives: string[];
  sessions: BlogSession[];
  collaboration: string[];
  quote: string;
  quoteSource: string;
}

export interface BlogAuthor {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export interface Blog {
  _id: string;
  title: string;
  img: string;
  tag: string;
  modal: BlogModal;
  author: BlogAuthor;
  createdAt: string;
  updatedAt: string;
}

/** Body shape for creating a blog — matches the ProjectModal frontend shape per the API docs. */
export interface BlogPayload {
  title: string;
  img: string;
  tag: string;
  modal: BlogModal;
}

/** GET /api/blogs — public, no auth needed. Used by both the dashboard list and the Environment page. */
export function getBlogs() {
  return apiRequest<Blog[]>("/api/blogs", { method: "GET" });
}

/** POST /api/blogs — requires login (admin/editor). Used by the dashboard "new" page. */
export function createBlog(payload: BlogPayload) {
  return apiRequest<Blog>("/api/blogs", {
    method: "POST",
    body: payload,
    auth: true,
  });
}

/**
 * TODO: confirm these three routes against the backend Swagger docs —
 * they weren't listed in the endpoint screenshot but are required for
 * the dashboard edit/delete flows. Once confirmed, wire them the same
 * way as getBlogs/createBlog above (no other file needs to change).
 */

// export function getBlogById(id: string) {
//   return apiRequest<Blog>(`/api/blogs/${id}`, { method: "GET" });
// }

// export function updateBlog(id: string, payload: BlogPayload) {
//   return apiRequest<Blog>(`/api/blogs/${id}`, {
//     method: "PUT",
//     body: payload,
//     auth: true,
//   });
// }

// export function deleteBlog(id: string) {
//   return apiRequest<{ message: string }>(`/api/blogs/${id}`, {
//     method: "DELETE",
//     auth: true,
//   });
// }