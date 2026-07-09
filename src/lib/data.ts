import { BlogPost, HistoryEntry, User, BlogStatus } from "@/types";

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
  { id: "u1", name: "Alice Admin", email: "alice@example.com", role: "ADMIN", active: true },
  { id: "u2", name: "Eddie Officer", email: "eddie@example.com", role: "COMMUNICATION_OFFICER", active: true },
  { id: "u3", name: "Ivy Influencer", email: "ivy@example.com", role: "SOCIAL_MEDIA_INFLUENCER", active: true },
];

const SEED_BLOGS: BlogPost[] = [
  {
    id: "b1",
    title: "Welcome to the dashboard",
    content: "This is your first published post.",
    tags: ["news"],
    authorId: "u3",
    authorName: "Ivy Influencer",
    status: "APPROVED",
    history: [{ id: uid("h"), action: "CREATED", by: "Ivy Influencer", at: nowIso() }],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "b2",
    title: "Draft campaign ideas",
    content: "Still working on this one.",
    tags: ["draft"],
    authorId: "u3",
    authorName: "Ivy Influencer",
    status: "DRAFT",
    history: [{ id: uid("h"), action: "CREATED", by: "Ivy Influencer", at: nowIso() }],
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
  return (await listUsers()).find((u) => u.id === id);
}

export async function createUser(data: Pick<User, "name" | "email" | "role">): Promise<User> {
  const users = await listUsers();
  const user: User = { id: uid("u"), active: true, ...data };
  write(USERS_KEY, [...users, user]);
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const users = await listUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...updates };
  write(USERS_KEY, users);
  return users[idx];
}

export async function deleteUser(id: string): Promise<void> {
  write(USERS_KEY, (await listUsers()).filter((u) => u.id !== id));
}

// ── Blogs ────────────────────────────────────────────────────────
export async function listBlogs(filter?: { authorId?: string; status?: BlogStatus }): Promise<BlogPost[]> {
  let blogs = read<BlogPost[]>(BLOGS_KEY, SEED_BLOGS);
  if (filter?.authorId) blogs = blogs.filter((b) => b.authorId === filter.authorId);
  if (filter?.status) blogs = blogs.filter((b) => b.status === filter.status);
  return blogs;
}

export async function getBlog(id: string): Promise<BlogPost | undefined> {
  return (await listBlogs()).find((b) => b.id === id);
}

// entry no longer needs `id` or `at` — both are generated here
function pushHistory(blog: BlogPost, entry: Omit<HistoryEntry, "id" | "at">): BlogPost {
  return {
    ...blog,
    history: [...blog.history, { id: uid("h"), at: nowIso(), ...entry }],
    updatedAt: nowIso(),
  };
}

async function saveBlog(blog: BlogPost): Promise<BlogPost> {
  const blogs = await listBlogs();
  const idx = blogs.findIndex((b) => b.id === blog.id);
  idx >= 0 ? (blogs[idx] = blog) : blogs.push(blog);
  write(BLOGS_KEY, blogs);
  return blog;
}

export async function createBlog(
  data: { title: string; content: string; tags: string[] },
  author: User
): Promise<BlogPost> {
  const blog: BlogPost = {
    id: uid("b"),
    ...data,
    authorId: author.id,
    authorName: author.name,
    status: "DRAFT",
    history: [{ id: uid("h"), action: "CREATED", by: author.name, at: nowIso() }],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return saveBlog(blog);
}

export async function editBlog(
  id: string,
  updates: { title?: string; content?: string; tags?: string[] },
  by: string
): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  return saveBlog(pushHistory({ ...blog, ...updates }, { action: "EDITED", by }));
}

export async function submitBlog(id: string, by: string): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  const action = blog.status === "REJECTED" ? "RESUBMITTED" : "SUBMITTED";
  return saveBlog(pushHistory({ ...blog, status: "PENDING", rejectionReason: undefined }, { action, by }));
}

export async function approveBlog(id: string, by: string): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  return saveBlog(
    pushHistory({ ...blog, status: "APPROVED", reviewerName: by, rejectionReason: undefined }, { action: "APPROVED", by })
  );
}

export async function rejectBlog(id: string, by: string, reason: string): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  return saveBlog(
    pushHistory({ ...blog, status: "REJECTED", reviewerName: by, rejectionReason: reason }, { action: "REJECTED", by, note: reason })
  );
}

export async function unpublishBlog(id: string, by: string): Promise<BlogPost | undefined> {
  const blog = await getBlog(id);
  if (!blog) return undefined;
  return saveBlog(pushHistory({ ...blog, status: "DRAFT" }, { action: "UNPUBLISHED", by }));
}

export async function deleteBlog(id: string): Promise<void> {
  write(BLOGS_KEY, (await listBlogs()).filter((b) => b.id !== id));
}

// ── "Session" (which seed user is currently signed in) ───────────
export function getCurrentUserSync(): User | null {
  if (!isBrowser) return null;
  const id = window.localStorage.getItem(SESSION_KEY) ?? SEED_USERS[0].id;
  window.localStorage.setItem(SESSION_KEY, id);
  const users = read<User[]>(USERS_KEY, SEED_USERS);
  return users.find((u) => u.id === id) ?? SEED_USERS[0];
}

export function setCurrentUser(id: string) {
  write(SESSION_KEY, id);
}