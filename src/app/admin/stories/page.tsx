'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import {
  FileText,
  Clock,
  CheckCircle2,
  Globe,
  Plus,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminStoriesPage() {
  const { user, loading, allowed } = useSession("blog:view");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Wrapped in useCallback for clean React Hook dependency tracking
  const fetchBlogs = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setFetchError(null);

    try {
      const response = await blogsApi.getBlogs(user.role as Role);

      let blogList: BlogPost[] = [];
      if (Array.isArray(response)) {
        blogList = response;
      } else if (response && Array.isArray(response.data)) {
        blogList = response.data;
      }

      setBlogs(blogList);
    } catch (err: unknown) {
      console.error("Failed to fetch stories:", err);
      const msg = err instanceof Error ? err.message : "Failed to load editorial stories.";
      setFetchError(msg);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && allowed) {
      fetchBlogs();
    }
  }, [user, allowed, fetchBlogs]);

  const stats = useMemo(() => {
    const total = blogs.length;
    const pending = blogs.filter(
      (b) => (b.status as string) === "pending_review" || (b.status as string) === "submitted"
    ).length;
    const approved = blogs.filter((b) => (b.status as string) === "approved").length;
    const published = blogs.filter((b) => (b.status as string) === "published").length;

    return { total, pending, approved, published };
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.tag?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || (b.status as string) === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [blogs, searchTerm, selectedStatus]);

  const handlePublish = async (id: string) => {
    if (!user) return;
    try {
      await blogsApi.publishBlog(id, user.role as Role);
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to publish blog:", err);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;
    try {
      await blogsApi.approveBlog(id, user.role as Role);
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to approve blog:", err);
    }
  };

  const handleReject = async (id: string, note?: string) => {
    if (!user) return;
    try {
      // ✅ FIX: Order must be (id, note, role)
      await blogsApi.rejectBlog(id, note, user.role as Role);
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to reject blog:", err);
    }
  };

  if (loading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Editorial Stories" subtitle="Verifying permissions…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
            </div>
            <div className="h-96 w-full rounded-2xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Master Editorial Management"
        subtitle="Manage all platform stories, review contributor submissions, and publish to the live feed"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Stories</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Review</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Globe size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Published</p>
              <p className="text-2xl font-bold text-slate-900">{stats.published}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stories by title or category..."
                className="w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-sm font-medium text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="relative min-w-[160px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Filter size={14} />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200/80 bg-white pl-9 pr-8 py-2 text-sm font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="ALL">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <Link
            href="/creator/my-stories/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:bg-indigo-800"
          >
            <Plus size={16} />
            Create Story
          </Link>
        </div>

        {/* Error State */}
        {fetchError && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchError}</p>
            </div>
            <button
              onClick={fetchBlogs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Story Table */}
        {dataLoading ? (
          <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <BlogTable
              blogs={filteredBlogs}
              user={user}
              onPublish={handlePublish}
              onApprove={handleApprove}
              onReject={handleReject}
              onRefreshNeeded={fetchBlogs}
            />
          </div>
        )}
      </main>
    </div>
  );
}