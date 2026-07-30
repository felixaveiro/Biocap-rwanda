'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { can } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function BlogListPage() {
  const { user, loading, allowed } = useSession("blog:view");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const fetchBlogs = async () => {
    if (!user) return;
    setDataLoading(true);
    setFetchError(null);

    try {
      const userRole = user.role as Role;
      const canViewAll = can(userRole, "blog:view:all");

      // Fetch scoped or all blogs depending on permissions
      const response: any = await blogsApi.getBlogs(userRole, {
        author: canViewAll ? undefined : user._id,
      });

      // Extract array safely across different backend response structures
      let blogList: BlogPost[] = [];
      if (Array.isArray(response)) {
        blogList = response;
      } else if (Array.isArray(response?.data)) {
        blogList = response.data;
      } else if (Array.isArray(response?.docs)) {
        blogList = response.docs;
      } else if (Array.isArray(response?.blogs)) {
        blogList = response.blogs;
      }

      setBlogs(blogList);
    } catch (err: unknown) {
      console.error("Failed to fetch blog list:", err);
      const msg = err instanceof Error ? err.message : "Failed to load articles.";
      setFetchError(msg);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [user]);

  // Derived Statistics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === "published").length;
    const pending = blogs.filter((b) => b.status === "submitted").length;
    const rejected = blogs.filter((b) => b.status === "rejected").length;

    return { total, published, pending, rejected };
  }, [blogs]);

  // Filtered Blog List
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const titleMatches = b.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const authorObj = typeof b.author === "object" ? b.author : null;
      const authorName = authorObj
        ? `${authorObj.firstName || ""} ${authorObj.lastName || ""}`
        : "";
      const authorMatches = authorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSearch = titleMatches || authorMatches;
      const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [blogs, searchTerm, selectedStatus]);

  // Handle Quick Editorial Status Change (Publish / Reject)
  const handleStatusChange = async (
    blogId: string,
    action: "publish" | "reject" | "approve",
    note?: string
  ) => {
    if (!user) return;
    try {
      const userRole = user.role as Role;
      if (action === "publish") {
        await blogsApi.publishBlog(blogId, userRole);
      } else if (action === "reject") {
        await blogsApi.rejectBlog(blogId, userRole, note || "Requires revisions.");
      } else if (action === "approve") {
        await blogsApi.approveBlog(blogId, userRole);
      }
      
      // Refresh list to sync with backend
      await fetchBlogs();
    } catch (err) {
      console.error(`Failed to ${action} article:`, err);
    }
  };

  // ─── SKELETON LOADING STATE ────────────────────────────────────────────────
  if (loading || !allowed || !user || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Editorial Workspace" subtitle="Loading articles and permissions…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
            </div>
            <div className="h-12 w-full rounded-2xl bg-slate-200/80" />
            <div className="h-96 w-full rounded-2xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    );
  }

  const userRole = user.role as Role;
  const canViewAll = can(userRole, "blog:view:all");
  const canCreate = can(userRole, "blog:create");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title={canViewAll ? "Editorial Workspace" : "My Stories"}
        subtitle="Manage drafts, review submissions, and control live publications"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Metric Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Articles
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Published
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.published}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                In Review
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Rejected
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        {/* Action Bar (Search, Status Filter, Create Button) */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or author name..."
                className="w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-sm font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Status Filter Selector */}
            <div className="relative min-w-[180px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Filter size={14} />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200/80 bg-white pl-9 pr-8 py-2 text-sm font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="ALL">All Statuses</option>
                <option value="draft">Drafts</option>
                <option value="submitted">In Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Conditional Create Button */}
          {canCreate && (
            <Link
              href="/dashboard/blog/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-2xs transition hover:bg-indigo-700 active:bg-indigo-800"
            >
              <Plus size={16} />
              New Article
            </Link>
          )}
        </div>

        {/* Error Alert Container */}
        {fetchError && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchError}</p>
            </div>
            <button
              onClick={fetchBlogs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Main Blog Table Area */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <BlogTable
            blogs={filteredBlogs}
            user={user}
            onPublish={(id) => handleStatusChange(id, "publish")}
            onReject={(id, note) => handleStatusChange(id, "reject", note)}
            onApprove={(id) => handleStatusChange(id, "approve")}
          />
        </div>
      </main>
    </div>
  );
}