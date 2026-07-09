export type Role = "ADMIN" | "COMMUNICATION_OFFICER" | "SOCIAL_MEDIA_INFLUENCER";

export const ROLES: Role[] = ["ADMIN", "COMMUNICATION_OFFICER", "SOCIAL_MEDIA_INFLUENCER"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  COMMUNICATION_OFFICER: "Communication Officer",
  SOCIAL_MEDIA_INFLUENCER: "Social Media Influencer",
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export type SessionUser = User;

export type BlogStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  APPROVED: "Published",
  REJECTED: "Rejected",
};

export type HistoryAction =
  | "CREATED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "RESUBMITTED"
  | "EDITED"
  | "UNPUBLISHED";

export interface HistoryEntry {
  id: string;
  action: HistoryAction;
  by: string;
  at: string;
  note?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: BlogStatus;
  rejectionReason?: string;
  reviewerName?: string;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}