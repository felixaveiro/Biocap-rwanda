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

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Lowercase backend roles
  admin: [
    "blog:view:all", "blog:create", "blog:edit", "blog:delete",
    "blog:approve", "blog:reject", "blog:publish", "blog:unpublish", "blog:resubmit",
    "user:view", "user:create", "user:edit:info", "user:edit:role", "user:delete",
  ],
  communication_officer: [
    "blog:view:all", "blog:create", "blog:edit",
    "blog:approve", "blog:reject", "blog:publish", "blog:resubmit",
    "user:view", "user:edit:info", "user:edit:role",
  ],
  editor: [
    "blog:view:all", "blog:create", "blog:edit",
    "blog:approve", "blog:reject", "blog:publish", "blog:resubmit",
  ],
  social_media_content_creator: ["blog:create", "blog:resubmit"],
  broadcast_content_creator: ["blog:create", "blog:resubmit"],

  // Uppercase legacy fallbacks
  ADMIN: [
    "blog:view:all", "blog:create", "blog:edit", "blog:delete",
    "blog:approve", "blog:reject", "blog:publish", "blog:unpublish", "blog:resubmit",
    "user:view", "user:create", "user:edit:info", "user:edit:role", "user:delete",
  ],
  COMMUNICATION_OFFICER: [
    "blog:view:all", "blog:create", "blog:edit",
    "blog:approve", "blog:reject", "blog:publish", "blog:resubmit",
    "user:view", "user:edit:info", "user:edit:role",
  ],
  EDITOR: [
    "blog:view:all", "blog:create", "blog:edit",
    "blog:approve", "blog:reject", "blog:publish", "blog:resubmit",
  ],
  SOCIAL_MEDIA_CONTENT_CREATOR: ["blog:create", "blog:resubmit"],
  BROADCAST_CONTENT_CREATOR: ["blog:create", "blog:resubmit"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Helper to extract author ID safely whether author is populated object or ID string
function getAuthorId(post: BlogPost): string {
  if (typeof post.author === "object" && post.author !== null) {
    return post.author._id || (post.author as unknown as { id?: string }).id || "";
  }
  return (post as unknown as { authorId?: string }).authorId || (post.author as string) || "";
}

export function canViewBlog(role: Role, userId: string, post: BlogPost): boolean {
  if (can(role, "blog:view:all")) return true;
  const authorId = getAuthorId(post);
  return authorId === userId;
}

export function canEditBlog(role: Role, userId: string, post: BlogPost): boolean {
  if (can(role, "blog:edit")) return true;
  const authorId = getAuthorId(post);
  const isAuthor = authorId === userId;
  const status = (post.status as string)?.toLowerCase();

  return isAuthor && (status === "draft" || status === "rejected" || status === "changes_requested");
}

export function canDeleteBlog(role: Role, userId: string, post: BlogPost): boolean {
  if (can(role, "blog:delete")) return true;
  const authorId = getAuthorId(post);
  const isAuthor = authorId === userId;
  const status = (post.status as string)?.toLowerCase();

  return isAuthor && status === "draft";
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