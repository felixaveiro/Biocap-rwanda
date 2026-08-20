// src/types/index.ts

export type Role =
  | 'admin'
  | 'communication_officer'
  | 'editor'
  | 'social_media_content_creator'
  | 'media_correspondent'
  | 'principal_investigator';

export const ROLES: Role[] = [
  'admin',
  'communication_officer',
  'editor',
  'social_media_content_creator',
  'media_correspondent',
  'principal_investigator',
];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  communication_officer: 'Communication Officer',
  editor: 'Editor',
  social_media_content_creator: 'Social Media Content Creator',
  media_correspondent: 'Media Correspondent',
  principal_investigator: 'Principal Investigator (PI)',
};

// ─── Rwanda BioCap Partner Institutions ─────────────────────────────────────
export const ORGANIZATIONS = [
  'International Potato Center (CIP)',
  'International Institute of Tropical Agriculture (IITA)',
  'Donald Danforth Plant Science Center (DDPSC)',
  'Michigan State University (MSU)',
  'Rwanda Agriculture and Animal Resources Development Board (RAB)',
  'Alliance for Science Rwanda (AfS-Rwanda)',
] as const;

export type Organization = (typeof ORGANIZATIONS)[number];

// Helper to resolve available registration roles based on selected institution
export function getRolesForOrganization(organization: string): Role[] {
  if (organization === 'Alliance for Science Rwanda (AfS-Rwanda)') {
    return [
      'social_media_content_creator',
      'media_correspondent',
      'communication_officer',
    ];
  }
  return ['principal_investigator', 'communication_officer'];
}

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
  organization: Organization | string;
  jobTitle: string; // Mandatory: Displayed as Author byline with articles
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

// ─── Change Request Interface ───────────────────────────────────────────────
export interface ChangeRequest {
  _id: string;
  commenter?: {
    _id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
  } | string;
  role?: string;
  comment: string;
  requestedAt: string;
  implemented?: boolean;
  implementedBy?: { _id: string; username?: string; firstName?: string; lastName?: string } | string;
  implementedAt?: string;
  implementationNote?: string;
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

// Flexible block structure matching article & editor components
export type BlockType = 'p' | 'h2' | 'quote' | 'emphasis' | 'image' | 'hero' | 'embed';

export interface BlogBlock {
  type: BlockType;
  text?: string;
  source?: string;
  src?: string;
  url?: string;
  fileKey?: string;
  caption?: string;
  fitMode?: 'cover' | 'contain';
}

export interface BlogModalMetadata {
  intro?: string;
  date?: string;
  organizer?: string;
  partners?: string;
  keyTakeaways?: string[];
  [key: string]: unknown;
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
  user?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    role?: Role;
  } | null;
  name?: string;
  email?: string;
  phone?: string;
  role?: Role | 'guest';
  content: string;
  parentComment?: string | null;
  isVisible?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  replies?: Comment[];
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
  img?: string;
  modifiedAt?: string;
}

// ─── Notification Alert Interface ───────────────────────────────────────────
export type NotificationType =
  | 'ARTICLE_COMMENT'
  | 'EDITOR_EDIT_PROMPT'
  | 'BLOG_APPROVED'
  | 'CHANGE_REQUEST'
  | 'CHANGE_REQUEST_IMPLEMENTED';

export type PublishConsentStatus = 'not_required' | 'pending' | 'approved' | 'rejected';

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
  article?: {
    _id: string;
    title: string;
    slug: string;
  };
  isRead?: boolean;
  read?: boolean;
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
  img: string; // Cover photo URL
  imgPublicId?: string;
  document?: string;
  documentUrl?: string;
  documentPublicId?: string;
  documentName?: string;

  // Frozen creator for public bylines
  originalAuthor?: {
    _id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    socialHandle?: string;
    organizationLink?: string;
    organization?: string;
  };
  originalAuthorRole?: Role;

  // Responsible editor / staff account
  author?: {
    _id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    role?: Role;
  };
  authorRole?: Role;

  socialHandle?: string;
  organizationLink?: string;
  status: BlogStatus;
  submittedAt?: string;
  lastRejectionNote?: string;
  reviewHistory?: ReviewLog[];

  // ─── Officer Review & Change Approvals ────────────────────────────────────
  editorModifications?: EditorModification | boolean | null;
  officerAcceptedChanges?: boolean;
  officerApprovalNote?: string;
  changeRequests?: ChangeRequest[];

  // ─── Published Article Comments ────────────────────────────────────────────
  comments?: Comment[];
  publishConsentStatus?: PublishConsentStatus;
  publishConsentRequestedAt?: string;
  publishConsentNote?: string;

  publishedAt?: string;
  publishedBy?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  isDeleted?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Flexible API Pagination Structure (supports both `data` array and `docs` array responses)
export interface PaginatedResponse<T> {
  data?: T[];
  docs?: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  totalDocs?: number;
  limit?: number;
  page?: number;
  totalPages?: number;
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