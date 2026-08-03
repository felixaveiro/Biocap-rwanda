'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import ImageCropperModal from "@/components/ImageCropperModal";
import { base64ToFile } from "@/lib/utils/file";
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
  Crop,
  ImageIcon,
  X,
} from "lucide-react";

export default function AdminStoriesPage() {
  const { user, loading, allowed } = useSession("blog:view");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [showTrash, setShowTrash] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Image Cropping & Quick Create/Edit Modal State ─────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [finalImageFile, setFinalImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Form fields for quick story creation
  const [storyTitle, setStoryTitle] = useState("");
  const [storyTag, setStoryTag] = useState("");
  const [storyExcerpt, setStoryExcerpt] = useState("");
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

  const fetchBlogs = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setFetchError(null);

    try {
      let response;
      if (showTrash) {
        response = await blogsApi.getDeletedBlogs(user.role as Role);
      } else {
        response = await blogsApi.getBlogs(user.role as Role, {
          page,
          limit: 10,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          search: searchTerm || undefined,
        });
      }

      let blogList: BlogPost[] = [];
      if (Array.isArray(response)) {
        blogList = response;
      } else if (response && Array.isArray(response.data)) {
        blogList = response.data;
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        }
      }

      setBlogs(blogList);
    } catch (err: unknown) {
      console.error("Failed to fetch stories:", err);
      const msg = err instanceof Error ? err.message : "Failed to load editorial stories.";
      setFetchError(msg);
    } finally {
      setDataLoading(false);
    }
  }, [user, page, selectedStatus, searchTerm, showTrash]);

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

  // ─── Image Handlers ──────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setIsCropperOpen(true);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = (croppedBase64: string) => {
    setCroppedPreview(croppedBase64);
    const file = base64ToFile(croppedBase64, "cropped-cover-image");
    setFinalImageFile(file);
  };

  const handleCreateStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalImageFile) {
      alert("Please upload and crop a cover image before publishing.");
      return;
    }

    setIsSubmittingStory(true);
    try {
      await blogsApi.createBlog(
        {
          title: storyTitle,
          tag: storyTag,
          excerpt: storyExcerpt,
          blocks: [{ type: "p", text: "Initial story section..." }],
          img: finalImageFile,
        },
        user?.role as Role
      );

      // Reset Form State
      setIsModalOpen(false);
      setStoryTitle("");
      setStoryTag("");
      setStoryExcerpt("");
      setCroppedPreview(null);
      setRawImageSrc(null);
      setFinalImageFile(null);

      await fetchBlogs();
    } catch (err) {
      console.error("Failed to create story:", err);
      alert("Failed to create story. Check your inputs.");
    } finally {
      setIsSubmittingStory(false);
    }
  };

  // ─── Workflow Actions ────────────────────────────────────────────────────────

  const handlePublishToggle = async (target: BlogPost | string) => {
    if (!user) return;

    const blog = typeof target === "string" 
      ? blogs.find((b) => b._id === target) 
      : target;

    if (!blog) return;

    try {
      if (blog.status === "published") {
        // ✅ Fixed: Pass `undefined` as 2nd arg (payload) so `user.role` aligns with 3rd arg (role)
        await blogsApi.unpublishBlog(blog._id, undefined, user.role as Role);
      } else {
        await blogsApi.publishBlog(blog._id, user.role as Role);
      }
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
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
      await blogsApi.rejectBlog(id, note, user.role as Role);
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to reject blog:", err);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!user || !confirm("Move this article to Trash?")) return;
    try {
      await blogsApi.deleteBlog(id, user.role as Role);
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to soft-delete blog:", err);
    }
  };

  const handleRestore = async (id: string) => {
    if (!user) return;
    try {
      await blogsApi.restoreBlog(id, user.role as Role);
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to restore blog:", err);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!user || !confirm("CRITICAL: Permanently wipe this story and remove Cloudinary media assets?")) return;
    try {
      await blogsApi.permanentDeleteBlog(id, user.role as Role);
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to permanently delete blog:", err);
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
        title={showTrash ? "Trash Bin" : "Master Editorial Management"}
        subtitle={
          showTrash
            ? "Restore soft-deleted articles or wipe them permanently from Cloudinary"
            : "Manage all platform stories, review contributor submissions, and publish to the live feed"
        }
      />

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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:bg-indigo-800"
            >
              <Plus size={16} />
              Create & Crop Story
            </button>
          </div>
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
              blogs={blogs}
              user={user}
              showTrash={showTrash}
              onPublish={handlePublishToggle}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleSoftDelete}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onRefreshNeeded={fetchBlogs}
            />
          </div>
        )}

        {/* Pagination Controls */}
        {!showTrash && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
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

      {/* ─── Story Creation Modal with Integrated Image Cropper ─────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Create & Crop Story</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStorySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Story Headline..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category / Tag</label>
                <input
                  type="text"
                  required
                  value={storyTag}
                  onChange={(e) => setStoryTag(e.target.value)}
                  placeholder="e.g. Technology, Health..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Cover Photo (16:9 Aspect Cropped)
                </label>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-4 bg-slate-50">
                  {croppedPreview ? (
                    <div className="w-full space-y-2 text-center">
                      <img
                        src={croppedPreview}
                        alt="Cropped Preview"
                        className="h-36 w-full object-cover rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        <Crop size={13} /> Re-crop Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-1.5 py-2">
                      <ImageIcon size={28} className="text-slate-400" />
                      <span className="text-xs font-semibold text-indigo-600">Select Image to Crop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  required
                  value={storyExcerpt}
                  onChange={(e) => setStoryExcerpt(e.target.value)}
                  placeholder="Brief summary..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStory}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmittingStory ? "Creating..." : "Save & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Image Cropper Viewport Modal ─────────────────────────────────────── */}
      {rawImageSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={rawImageSrc}
          aspectRatio={16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}