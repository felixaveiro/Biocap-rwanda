"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Trash2,
} from "lucide-react";

export default function EditorManagePage() {
  const { user: currentEditorUser, loading: sessionLoading, allowed } = useSession("blog:view");

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showTrash, setShowTrash] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllBlogs = useCallback(async () => {
    if (!currentEditorUser) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let response;
      if (showTrash) {
        response = await blogsApi.getDeletedBlogs(currentEditorUser.role as Role);
      } else {
        response = await blogsApi.getBlogs(currentEditorUser.role as Role, {
          page,
          limit: 10,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          search: searchTerm || undefined,
        });
      }

      let list: BlogPost[] = [];
      if (Array.isArray(response)) list = response;
      else if (response && Array.isArray(response.data)) {
        list = response.data;
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        }
      }

      setBlogs(list);
    } catch (err: unknown) {
      console.error("Failed to load editor blog catalog:", err);
      const m = err instanceof Error ? err.message : "Failed to load blogs.";
      setErrorMsg(m);
    } finally {
      setIsLoading(false);
    }
  }, [currentEditorUser, page, selectedStatus, searchTerm, showTrash]);

  useEffect(() => {
    if (currentEditorUser && allowed) fetchAllBlogs();
  }, [currentEditorUser, allowed, fetchAllBlogs]);

  const stats = useMemo(() => {
    const total = blogs.length;
    const pending = blogs.filter(
      (b) => (b.status as string) === "pending_review" || (b.status as string) === "submitted"
    ).length;
    const approved = blogs.filter((b) => (b.status as string) === "approved").length;
    const published = blogs.filter((b) => (b.status as string) === "published").length;

    return { total, pending, approved, published };
  }, [blogs]);

  // ─── Workflow Actions (mirror Admin handlers) ─────────────────────────────

  const handlePublishToggle = async (target: BlogPost | string) => {
    if (!currentEditorUser) return;

    const blog = typeof target === "string" ? blogs.find((b) => b._id === target) : target;
    if (!blog) return;

    try {
      if (blog.status === "published") {
        await blogsApi.unpublishBlog(blog._id, undefined, currentEditorUser.role as Role);
      } else {
        await blogsApi.publishBlog(blog._id, currentEditorUser.role as Role);
      }
      await fetchAllBlogs();
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
    }
  };

  const handleApprove = async (id: string) => {
    if (!currentEditorUser) return;
    try {
      await blogsApi.approveBlog(id, currentEditorUser.role as Role);
      await fetchAllBlogs();
    } catch (err) {
      console.error("Failed to approve blog:", err);
    }
  };

  const handleReject = async (id: string, note?: string) => {
    if (!currentEditorUser) return;
    try {
      await blogsApi.rejectBlog(id, note, currentEditorUser.role as Role);
      await fetchAllBlogs();
    } catch (err) {
      console.error("Failed to reject blog:", err);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!currentEditorUser || !confirm("Move this article to Trash?")) return;
    try {
      await blogsApi.deleteBlog(id, currentEditorUser.role as Role);
      await fetchAllBlogs();
    } catch (err) {
      console.error("Failed to soft-delete blog:", err);
    }
  };

  const handleRestore = async (id: string) => {
    if (!currentEditorUser) return;
    try {
      await blogsApi.restoreBlog(id, currentEditorUser.role as Role);
      await fetchAllBlogs();
    } catch (err) {
      console.error("Failed to restore blog:", err);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!currentEditorUser || !confirm("CRITICAL: Permanently wipe this story and remove Cloudinary media assets?")) return;
    try {
      await blogsApi.permanentDeleteBlog(id, currentEditorUser.role as Role);
      await fetchAllBlogs();
    } catch (err) {
      console.error("Failed to permanently delete blog:", err);
    }
  };

  if (sessionLoading || !allowed || !currentEditorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Editor Manage" subtitle="Verifying permissions..." />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header title={showTrash ? "Editor Trash" : "Editor Catalog"} subtitle="Full article catalog — editable by Editors" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Metric Cards */}
        {!showTrash && (
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
        )}

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

            {!showTrash && (
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
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTrash(!showTrash)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                showTrash
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Trash2 size={16} />
              {showTrash ? "Back to Active Stories" : "Trash Bin"}
            </button>

            <button
              type="button"
              onClick={() => fetchAllBlogs()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
            <button
              onClick={fetchAllBlogs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* Story Table */}
        {isLoading ? (
          <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <BlogTable
              blogs={blogs}
              user={currentEditorUser}
              showTrash={showTrash}
              onPublish={handlePublishToggle}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleSoftDelete}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onRefreshNeeded={fetchAllBlogs}
            />
          </div>
        )}

        {/* Pagination Controls */}
        {!showTrash && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-900">{page}</span> of {" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
