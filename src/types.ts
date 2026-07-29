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
  reviewer: {
    _id: string;
    firstName: string;
    lastName: string;
    role: Role;
  } | string;
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
  dateOfBirth?: string;
  avatar?: string;
  organization?: string;
  organizationLink?: string;
  socialHandle?: string;
  createdBy?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  } | string;
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

export type BlogStatus = 'draft' | 'pending_review' | 'approved' | 'published';

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  published: 'Published',
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
  reviewer: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    role?: Role;
  } | string;
  note?: string;
  reviewedAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  blocks: BlogBlock[];
  modal?: BlogModalMetadata;
  img: string;
  imgPublicId: string;
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