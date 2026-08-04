export type Role =
  | 'admin'
  | 'communication_officer'
  | 'editor'
  | 'social_media_content_creator'
  | 'broadcast_content_creator';

export const ROLES: Role[] = [
  'admin',
  'communication_officer',
  'editor',
  'social_media_content_creator',
  'broadcast_content_creator',
];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  communication_officer: 'Communication Officer',
  editor: 'Editor',
  social_media_content_creator: 'Social Media Content Creator',
  broadcast_content_creator: 'Broadcast Content Creator',
};

export type ProfileReviewStatus = 'pending' | 'verified' | 'needs_attention';

export interface UserReviewLog {
  decision: 'verified' | 'needs_attention' | 'noted';
  reviewer:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        role: Role;
      }
    | string;
  note?: string;
  reviewedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  receiveNotifications?: boolean;
  dateOfBirth?: string;
  avatar?: string;
  organization?: string;
  organizationLink?: string;
  socialHandle?: string;
  createdBy?:
    | {
        _id: string;
        username: string;
        firstName: string;
        lastName: string;
      }
    | string;
  profileReviewStatus: ProfileReviewStatus;
  profileReviewHistory?: UserReviewLog[];
  lastProfileReviewNote?: string;
  isPasswordResetRequired?: boolean;
  lastLoginAt?: string;
  loginCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type SessionUser = User;

// Extended BlogStatus
export type BlogStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'revision_requested';

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected',
  revision_requested: 'Revision Requested',
};

// Flexible block structure matching article component
export type BlockType = 'p' | 'h2' | 'quote' | 'emphasis' | 'image';

export interface BlogBlock {
  type: BlockType;
  text?: string;
  source?: string;
  src?: string;
  caption?: string;
}

export interface BlogModalMetadata {
  date?: string;
  organizer?: string;
  partners?: string;
}

export interface ReviewLog {
  decision: 'approved' | 'rejected';
  reviewer:
    | {
        _id: string;
        username: string;
        firstName: string;
        lastName: string;
        role?: Role;
      }
    | string;
  note?: string;
  reviewedAt: string;
}

// ─── Comment Interface for Published Articles ────────────────────────────────
export interface Comment {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    role: Role;
  };
  content: string;
  createdAt: string;
}

// ─── Proposed Editor Modifications ───────────────────────────────────────────
export interface EditorModification {
  editor?:
    | {
        _id: string;
        firstName: string;
        lastName: string;
      }
    | string;
  title?: string;
  excerpt?: string;
  blocks?: BlogBlock[];
  img?: string; // 👈 Fixed: Added cover image edit support
  modifiedAt?: string;
}

// ─── Notification Alert Interface ───────────────────────────────────────────
export type NotificationType = 'ARTICLE_COMMENT' | 'EDITOR_EDIT_PROMPT' | 'BLOG_APPROVED';

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role: Role;
    username: string;
  };
  type: NotificationType;
  message: string;
  article: {
    _id: string;
    title: string;
    slug: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Main Article Interface ──────────────────────────────────────────────────
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  blocks: BlogBlock[];
  modal?: BlogModalMetadata;
  img: string;
  imgPublicId?: string;
  documentUrl?: string;
  documentPublicId?: string;
  documentName?: string;

  // Frozen creator for public bylines
  originalAuthor: {
    _id: string;
    username: string;
    email?: string;
    firstName: string;
    lastName: string;
    socialHandle?: string;
    organizationLink?: string;
    organization?: string;
  };
  originalAuthorRole: Role;

  // Responsible editor / staff account
  author: {
    _id: string;
    username: string;
    email?: string;
    firstName: string;
    lastName: string;
    role?: Role;
  };
  authorRole: Role;

  socialHandle?: string;
  organizationLink?: string;
  status: BlogStatus;
  submittedAt?: string;
  lastRejectionNote?: string;
  reviewHistory: ReviewLog[];

  // ─── Officer Review & Change Approvals ────────────────────────────────────
  editorModifications?: EditorModification | null; // 👈 Fixed: Added null allowance
  officerAcceptedChanges?: boolean;
  officerApprovalNote?: string;

  // ─── Published Article Comments ────────────────────────────────────────────
  comments?: Comment[];

  publishedAt?: string;
  publishedBy?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  isDeleted: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// API Pagination Structure
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Dashboard & Stats Summary Response
export interface BlogStatsResponse {
  draft: number;
  pending_review: number;
  approved: number;
  published: number;
  rejected?: number;
  deleted?: number;
  total: number;
}