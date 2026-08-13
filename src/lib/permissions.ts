import { Role, BlogPost } from "@/types";

export type Permission =
  | "blog:view"       // Resolves useSession("blog:view") TypeScript checks
  | "blog:view:all"
  | "blog:create"
  | "blog:edit"
  | "blog:delete"
  | "blog:approve"
  | "blog:reject"
  | "blog:publish"
  | "blog:unpublish"
  | "blog:submit"
  | "user:view"
  | "user:create"
  | "user:edit:info"
  | "user:edit:role"
  | "user:deactivate"
  | "user:delete"
  | "user:review";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "blog:view",
    "blog:view:all",
    "blog:create",
    "blog:edit",
    "blog:delete",
    "blog:approve",
    "blog:reject",
    "blog:publish",
    "blog:unpublish",
    "blog:submit",
    "user:view",
    "user:create",
    "user:edit:info",
    "user:edit:role",
    "user:deactivate",
    "user:delete",
    "user:review",
  ],
  communication_officer: [
    "blog:view",
    "blog:view:all",
    "blog:create",
    "blog:edit",
    "blog:delete",
    "blog:approve",
    "blog:reject",
    "blog:publish",
    "blog:unpublish",
    "blog:submit",
    "user:view",
    "user:create",
    "user:edit:info",
    "user:review",
  ],
  editor: [
    "blog:view",
    "blog:view:all",
    "blog:create",
    "blog:edit",
    "blog:delete",
    "blog:approve",
    "blog:reject",
    "blog:publish",
    "blog:unpublish",
    "blog:submit",
  ],
  social_media_content_creator: [
    "blog:view",
    "blog:create",
    "blog:submit",
  ],
  media_correspondent: [
    "blog:view",
    "blog:create",
    "blog:submit",
  ],
  principal_investigator: [
    "blog:view",
    "blog:create",
    "blog:submit",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isOwner(userId: string, post: BlogPost): boolean {
  if (!userId || !post) return false;

  const originalId =
    typeof post.originalAuthor === "object" && post.originalAuthor !== null
      ? post.originalAuthor._id
      : post.originalAuthor;

  const authorId =
    typeof post.author === "object" && post.author !== null
      ? post.author._id
      : post.author;

  return originalId === userId || authorId === userId;
}

export function canViewBlog(role: Role, userId: string, post: BlogPost): boolean {
  return can(role, "blog:view:all") || isOwner(userId, post);
}

export function canEditBlog(role: Role, userId: string, post: BlogPost): boolean {
  if (role === "admin") return true;

  const status = post.status as string;
  if (status === "published" && role !== "communication_officer" && role !== "editor") {
    return false;
  }
  if (can(role, "blog:edit")) return true;

  // Creators can edit their own posts if in 'draft' or 'rejected' / 'changes_requested' status
  return (
    isOwner(userId, post) &&
    (status === "draft" || status === "rejected" || status === "changes_requested")
  );
}

export function canDeleteBlog(role: Role, userId: string, post: BlogPost): boolean {
  const status = post.status as string;
  if (status === "published") return role === "admin";
  if (can(role, "blog:delete")) return true;
  return isOwner(userId, post) && status === "draft";
}

export interface NavVisibility {
  blog: boolean;
  pending: boolean;
  users: boolean;
  settings: boolean;
}

export function visibleNav(role: Role): NavVisibility {
  return {
    blog: can(role, "blog:view"),
    pending: can(role, "blog:approve"),
    users: can(role, "user:view"),
    settings: true,
  };
}