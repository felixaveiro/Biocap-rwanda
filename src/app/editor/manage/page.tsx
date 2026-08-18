"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import {
  Search,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ── Type system (matches My Stories / Create Story) ────────────
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

// ── Palette — canvas #F3F2ED · ink #1E2620 · moss #3F6B4F · gold #A9812F · clay #B65C4B · sky #4A6E8A · line #D9D4C6

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

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  if (sessionLoading || !allowed || !currentEditorUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16`} style={bodyFont}>
        <Header title="Editor Manage" subtitle="Verifying permissions..." />
        <div className="p-8 text-sm text-[#6B7268]">Loading…</div>
      </div>
    );
  }

  return (
    <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16 text-[#1E2620]`} style={bodyFont}>
      <Header title={showTrash ? "Editor Trash" : "Editor Catalog"} subtitle="Full article catalog — editable by Editors" />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Masthead / nameplate */}
        <div className="pb-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#6B7268]" style={monoFont}>
            Editorial desk
          </span>
          <h1 className="mt-1.5 text-[26px] italic leading-none text-[#1E2620] sm:text-3xl" style={displayFont}>
            {showTrash ? "Discarded articles" : "The full catalog"}
          </h1>
        </div>
        <div className="space-y-[3px]">
          <div className="h-[2px] w-full bg-[#1E2620]" />
          <div className="h-px w-full bg-[#1E2620]" />
        </div>

        {/* Ledger stat row */}
        {!showTrash && (
          <div className="mb-8 mt-5 grid grid-cols-2 divide-x divide-[#D9D4C6] border border-[#E2DDCF] bg-white sm:grid-cols-4">
            {[
              { label: "Total stories", value: stats.total },
              { label: "Pending review", value: stats.pending, accent: "#A9812F" },
              { label: "Approved", value: stats.approved, accent: "#3F6B4F" },
              { label: "Live published", value: stats.published, accent: "#4A6E8A" },
            ].map((s) => (
              <div key={s.label} className="px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8B9188]">{s.label}</p>
                <p
                  className="mt-1 text-2xl tabular-nums"
                  style={{ ...monoFont, color: s.accent ?? "#1E2620" }}
                >
                  {String(s.value).padStart(2, "0")}
                </p>
              </div>
            ))}
          </div>
        )}
        {showTrash && <div className="mb-8 mt-5" />}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 border-b border-[#E2DDCF] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8B9188]">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stories by title or category…"
                className="w-full border border-[#D9D4C6] bg-white py-2 pl-10 pr-4 text-sm text-[#1E2620] placeholder:text-[#B4B0A2] focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15"
              />
            </div>

            {!showTrash && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full min-w-[160px] appearance-none border border-[#D9D4C6] bg-white px-3.5 py-2 text-sm text-[#3A4239] focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15 sm:w-auto"
              >
                <option value="ALL">All statuses</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTrash(!showTrash)}
              className={`inline-flex items-center gap-2 border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                showTrash
                  ? "border-[#A9812F] bg-[#FBF6E9] text-[#8A6A24]"
                  : "border-[#D9D4C6] bg-white text-[#3A4239] hover:border-[#1E2620]"
              }`}
            >
              <Trash2 size={14} />
              {showTrash ? "Back to active stories" : "Trash bin"}
            </button>

            <button
              type="button"
              onClick={() => fetchAllBlogs()}
              className="inline-flex items-center justify-center gap-2 border border-[#D9D4C6] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition-colors hover:border-[#1E2620]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="mb-6 flex items-center justify-between gap-3 border-l-2 border-[#B65C4B] bg-[#FBEEEC] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
              <p className="text-xs font-medium text-[#7A362A]">{errorMsg}</p>
            </div>
            <button
              onClick={fetchAllBlogs}
              className="inline-flex items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#B65C4B] transition-colors hover:bg-[#B65C4B] hover:text-white"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* Story Table */}
        {isLoading ? (
          <div className="h-64 w-full animate-pulse border border-[#E2DDCF] bg-white" />
        ) : (
          <div className="overflow-hidden border border-[#E2DDCF] bg-white">
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
            <p className="text-xs text-[#6B7268]" style={monoFont}>
              Page {String(page).padStart(2, "0")} of {String(totalPages).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition-colors hover:border-[#1E2620] disabled:opacity-35 disabled:hover:border-[#D9D4C6]"
              >
                <ChevronLeft size={13} /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition-colors hover:border-[#1E2620] disabled:opacity-35 disabled:hover:border-[#D9D4C6]"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}