import { Role, User, BlogPost } from "@/types";

export type Permission =
  | "blog:view:all"
  | "blog:create"
  | "blog:edit"
  | "blog:delete"
  | "blog:approve"
  | "blog:reject"
  | "blog:publish"
  | "blog:unpublish"
  | "blog:resubmit"
  | "user:view"
  | "user:create"
  | "user:edit:info"
  | "user:edit:role"
  | "user:delete";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "blog:view:all", "blog:create", "blog:edit", "blog:delete",
    "blog:approve", "blog:reject", "blog:publish", "blog:unpublish", "blog:resubmit",
    "user:view", "user:create", "user:edit:info", "user:edit:role", "user:delete",
  ],
  COMMUNICATION_OFFICER: [
    "blog:view:all", "blog:create", "blog:edit",
    "blog:approve", "blog:reject", "blog:publish", "blog:resubmit",
    "user:view", "user:edit:info",
  ],
  SOCIAL_MEDIA_INFLUENCER: ["blog:create", "blog:resubmit"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Note the 3-arg signature (role, userId, post) — matches how components call it
export function canViewBlog(role: Role, userId: string, post: BlogPost): boolean {
  return can(role, "blog:view:all") || post.authorId === userId;
}

export function canEditBlog(role: Role, userId: string, post: BlogPost): boolean {
  if (can(role, "blog:edit")) return true;
  return post.authorId === userId && (post.status === "DRAFT" || post.status === "REJECTED");
}

export function canDeleteBlog(role: Role, userId: string, post: BlogPost): boolean {
  if (can(role, "blog:delete")) return true;
  return post.authorId === userId && post.status === "DRAFT";
}

// Shape matches what Sidebar.tsx consumes directly
export interface NavVisibility {
  overview: boolean;
  allBlogs: boolean;
  pendingApprovals: boolean;
  users: boolean;
  settings: boolean;
}

export function visibleNav(role: Role): NavVisibility {
  return {
    overview: true,
    allBlogs: can(role, "blog:view:all"),
    pendingApprovals: can(role, "blog:approve"),
    users: can(role, "user:view"),
    settings: true,
  };
}