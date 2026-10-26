import { BlogPost, User, BlogStatus } from "@/types";

const USERS_KEY = "app:users";
const BLOGS_KEY = "app:blogs";
const SESSION_KEY = "app:currentUserId";
const isBrowser = typeof window !== "undefined";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

// ── Seed data ────────────────────────────────────────────────────
const SEED_USERS: User[] = [
  {
    _id: "u1",
    username: "alice_admin",
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Admin",
    role: "admin",
    organization: "Alliance for Science Rwanda (AfS-Rwanda)",
    jobTitle: "System Administrator",
    isActive: true,
    profileReviewStatus: "verified",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    _id: "u2",
    username: "eddie_officer",
    email: "eddie@example.com",
    firstName: "Eddie",
    lastName: "Officer",
    role: "communication_officer",
    organization: "Rwanda Agriculture and Animal Resources Development Board (RAB)",
    jobTitle: "Communication Officer",
    isActive: true,
    profileReviewStatus: "verified",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    _id: "u3",
    username: "nadia_editor",
    email: "nadia@example.com",
    firstName: "Nadia",
    lastName: "Editor",
    role: "editor",
    organization: "Alliance for Science Rwanda (AfS-Rwanda)",
    jobTitle: "Senior Managing Editor",
    isActive: true,
    profileReviewStatus: "verified",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    _id: "u4",
    username: "ivy_social",
    email: "ivy@example.com",
    firstName: "Ivy",
    lastName: "Social",
    role: "social_media_content_creator",
    organization: "Alliance for Science Rwanda (AfS-Rwanda)",
    jobTitle: "Social Media Strategist",
    isActive: true,
    profileReviewStatus: "verified",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    _id: "u5",
    username: "ben_correspondent",
    email: "ben@example.com",
    firstName: "Ben",
    lastName: "Correspondent",
    role: "media_correspondent",
    organization: "Alliance for Science Rwanda (AfS-Rwanda)",
    jobTitle: "Broadcast Media Correspondent",
    isActive: true,
    profileReviewStatus: "verified",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

const SEED_BLOGS: BlogPost[] = [
  {
    _id: "b1",
    title: "Welcome to the dashboard",
    slug: "welcome-to-the-dashboard",
    tag: "news",
    excerpt: "This is your first published post.",
    blocks: [{ type: "p", text: "This is your first published post." }],
    img: "https://via.placeholder.com/800x450",
    imgPublicId: "placeholder",
    originalAuthor: {
      _id: "u3",
      username: "nadia_editor",
      firstName: "Nadia",
      lastName: "Editor",
      jobTitle: "Senior Managing Editor",
      organization: "Alliance for Science Rwanda (AfS-Rwanda)",
    },
    originalAuthorRole: "editor",
    author: {
      _id: "u3",
      username: "nadia_editor",
      firstName: "Nadia",
      lastName: "Editor",
      jobTitle: "Senior Managing Editor",
      role: "editor",
    },
    authorRole: "editor",
    status: "approved",
    reviewHistory: [],
    isDeleted: false,
    views: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    _id: "b2",
    title: "Draft campaign ideas",
    slug: "draft-campaign-ideas",
    tag: "draft",
    excerpt: "Still working on this one.",
    blocks: [{ type: "p", text: "Still working on this one." }],
    img: "https://via.placeholder.com/800x450",
    imgPublicId: "placeholder",
    originalAuthor: {
      _id: "u3",
      username: "nadia_editor",
      firstName: "Nadia",
      lastName: "Editor",
      jobTitle: "Senior Managing Editor",
      organization: "Alliance for Science Rwanda (AfS-Rwanda)",
    },
    originalAuthorRole: "editor",
    author: {
      _id: "u3",
      username: "nadia_editor",
      firstName: "Nadia",
      lastName: "Editor",
      jobTitle: "Senior Managing Editor",
      role: "editor",
    },
    authorRole: "editor",
    status: "draft",
    reviewHistory: [],
    isDeleted: false,
    views: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// ── Generic storage helpers ─────────────────────────────────────
function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (isBrowser) window.localStorage.setItem(key, JSON.stringify(value));
}

// ── Users ────────────────────────────────────────────────────────
export async function listUsers(): Promise<User[]> {
  return read<User[]>(USERS_KEY, SEED_USERS);
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await listUsers()).find((u) => u._id === id);
}

export async function createUser(
  data: Pick<User, "firstName" | "lastName" | "email" | "role" | "username" | "organization"> & { jobTitle?: string }
): Promise<User> {
  const users = await listUsers();
  const user: User = {
    _id: uid("u"),
    isActive: true,
    profileReviewStatus: "verified",
    jobTitle: data.jobTitle || "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...data,
  };
  write(USERS_KEY, [...users, user]);
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const users = await listUsers();
  const idx = users.findIndex((u) => u._id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...updates, updatedAt: nowIso() };
  write(USERS_KEY, users);
  return users[idx];
}

export async function deleteUser(id: string): Promise<void> {
  write(USERS_KEY, (await listUsers()).filter((u) => u._id !== id));
}

// ── Blogs ────────────────────────────────────────────────────────
export async function listBlogs(filter?: { authorId?: string; status?: BlogStatus }): Promise<BlogPost[]> {
  let blogs = read<BlogPost[]>(BLOGS_KEY, SEED_BLOGS);
  if (filter?.authorId) {
    blogs = blogs.filter((b) => (typeof b.author === 'object' ? b.author._id : b.author) === filter.authorId);
  }
  if (filter?.status) {
    blogs = blogs.filter((b) => b.status === filter.status);
  }
  return blogs;
}

export async function getBlog(id: string): Promise<BlogPost | undefined> {
  return (await listBlogs()).find((b) => b._id === id);
}

async function saveBlog(blog: BlogPost): Promise<BlogPost> {
  const blogs = await listBlogs();
  const idx = blogs.findIndex((b) => b._id === blog._id);
  if (idx >= 0) {
    blogs[idx] = blog;
  } else {
    blogs.push(blog);
  }
  write(BLOGS_KEY, blogs);
  return blog;
}

export async function createBlog(
  data: { title: string; excerpt: string; tag: string },
  author: User
): Promise<BlogPost> {
  const blog: BlogPost = {
    _id: uid("b"),
    title: data.title,
    slug: data.title.toLowerCase().replace(/\s+/g, '-'),
    tag: data.tag,
    excerpt: data.excerpt,
    blocks: [{ type: "p", text: data.excerpt }],
    img: "https://via.placeholder.com/800x450",
    imgPublicId: "placeholder",
    originalAuthor: {
      _id: author._id,
      username: author.username,
      firstName: author.firstName,
      lastName: author.lastName,
      jobTitle: author.jobTitle,
      organization: typeof author.organization === 'string' ? author.organization : undefined,
    },
    originalAuthorRole: author.role,
    author: {
      _id: author._id,
      username: author.username,
      firstName: author.firstName,
      lastName: author.lastName,
      jobTitle: author.jobTitle,
      role: author.role,
    },
    authorRole: author.role,
    status: "draft",
    reviewHistory: [],
    isDeleted: false,
    views: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return saveBlog(blog);
}

export async function editBlog(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  return saveBlog({ ...blog, ...updates, updatedAt: nowIso() });
}

export async function submitBlog(id: string): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  return saveBlog({ ...blog, status: "pending_review", updatedAt: nowIso() });
}

export async function approveBlog(id: string): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  return saveBlog({ ...blog, status: "approved", updatedAt: nowIso() });
}

export async function deleteBlog(id: string): Promise<void> {
  write(BLOGS_KEY, (await listBlogs()).filter((b) => b._id !== id));
}

// ── "Session" (which seed user is currently signed in) ───────────
export function getCurrentUserSync(): User | null {
  if (!isBrowser) return null;
  const id = window.localStorage.getItem(SESSION_KEY) ?? SEED_USERS[0]._id;
  window.localStorage.setItem(SESSION_KEY, id);
  const users = read<User[]>(USERS_KEY, SEED_USERS);
  return users.find((u) => u._id === id) ?? SEED_USERS[0];
}

export function setCurrentUser(id: string) {
  write(SESSION_KEY, id);
}