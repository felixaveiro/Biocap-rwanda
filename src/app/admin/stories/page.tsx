'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
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
  Sparkles,
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [finalImageFile, setFinalImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Form fields
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

  const handlePublishToggle = async (target: BlogPost | string) => {
    if (!user) return;

    const blog = typeof target === "string" 
      ? blogs.find((b) => b._id === target) 
      : target;

    if (!blog) return;

    try {
      if (blog.status === "published") {
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
      <div className="min-h-screen bg-[#FAF9F5] pb-16 font-sans">
        <Header title="Editorial Stories" subtitle="Verifying permissions…" />
        <div className="mx-auto max-w-7xl px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="h-24 rounded-sm bg-[#EFECE6]" />
              <div className="h-24 rounded-sm bg-[#EFECE6]" />
              <div className="h-24 rounded-sm bg-[#EFECE6]" />
              <div className="h-24 rounded-sm bg-[#EFECE6]" />
            </div>
            <div className="h-96 w-full rounded-sm bg-[#EFECE6]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]">
      <Header
        title={showTrash ? "Trash Bin" : "Master Editorial Management"}
        subtitle={
          showTrash
            ? "Restore soft-deleted articles or wipe them permanently from Cloudinary"
            : "Manage platform stories, review contributor submissions, and publish to live feeds"
        }
      />

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Metric Cards */}
        {!showTrash && (
          <div className="mb-10 grid gap-5 sm:grid-cols-4">
            <div className="bg-[#FAF9F5] border-t-2 border-[#1E2620] border-b border-x border-[#E2DDCF] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]">
                  Total Index
                </span>
                <FileText size={16} className="text-[#3F6B4F]" />
              </div>
              <p className="mt-3 text-3xl font-serif italic text-[#1E2620]">{stats.total}</p>
            </div>

            <div className="bg-[#FAF9F5] border-t-2 border-[#A9812F] border-b border-x border-[#E2DDCF] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]">
                  Pending Review
                </span>
                <Clock size={16} className="text-[#A9812F]" />
              </div>
              <p className="mt-3 text-3xl font-serif italic text-[#1E2620]">{stats.pending}</p>
            </div>

            <div className="bg-[#FAF9F5] border-t-2 border-[#3F6B4F] border-b border-x border-[#E2DDCF] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]">
                  Approved
                </span>
                <CheckCircle2 size={16} className="text-[#3F6B4F]" />
              </div>
              <p className="mt-3 text-3xl font-serif italic text-[#1E2620]">{stats.approved}</p>
            </div>

            <div className="bg-[#FAF9F5] border-t-2 border-[#1E2620] border-b border-x border-[#E2DDCF] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]">
                  Live Published
                </span>
                <Globe size={16} className="text-[#1E2620]" />
              </div>
              <p className="mt-3 text-3xl font-serif italic text-[#1E2620]">{stats.published}</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2DDCF] pb-5">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#7A8079]">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search index by headline or tag..."
                className="w-full bg-[#FAF9F5] border border-[#D9D4C6] pl-9 pr-4 py-2 text-xs text-[#1E2620] placeholder-[#7A8079] focus:border-[#3F6B4F] focus:outline-none focus:ring-1 focus:ring-[#3F6B4F]"
              />
            </div>

            {/* Filter Dropdown */}
            {!showTrash && (
              <div className="relative min-w-[160px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#7A8079]">
                  <Filter size={13} />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none bg-[#FAF9F5] border border-[#D9D4C6] pl-8 pr-8 py-2 text-xs uppercase tracking-wider text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
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

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowTrash(!showTrash)}
              className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                showTrash
                  ? "border-[#8B4136] bg-[#8B4136]/10 text-[#8B4136]"
                  : "border-[#D9D4C6] bg-[#FAF9F5] text-[#5A6259] hover:border-[#1E2620] hover:text-[#1E2620]"
              }`}
            >
              <Trash2 size={13} />
              {showTrash ? "Active Catalog" : "Trash Bin"}
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#1E2620] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#FAF9F5] transition-colors hover:bg-[#3F6B4F]"
            >
              <Plus size={14} />
              Draft Story
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {fetchError && (
          <div className="mb-6 flex items-center justify-between border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} />
              <p className="text-xs font-medium">{fetchError}</p>
            </div>
            <button
              onClick={fetchBlogs}
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B4136] underline hover:text-[#1E2620]"
            >
              <RefreshCw size={12} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Table Container */}
        {dataLoading ? (
          <div className="h-64 w-full animate-pulse border border-[#E2DDCF] bg-[#EFECE6]" />
        ) : (
          <div className="border border-[#E2DDCF] bg-[#FAF9F5]">
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
          <div className="mt-6 flex items-center justify-between border-t border-[#E2DDCF] pt-4">
            <p className="text-[11px] uppercase tracking-wider text-[#7A8079]">
              Folio <span className="font-semibold text-[#1E2620]">{page}</span> of{" "}
              <span className="font-semibold text-[#1E2620]">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5A6259] disabled:opacity-30 hover:border-[#1E2620] hover:text-[#1E2620]"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5A6259] disabled:opacity-30 hover:border-[#1E2620] hover:text-[#1E2620]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Story Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2620]/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border-t-4 border-[#1E2620] bg-[#FAF9F5] p-6 border-x border-b border-[#E2DDCF] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2DDCF] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#A9812F]" />
                <h3 className="font-serif italic text-lg text-[#1E2620]">New Story Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#7A8079] hover:text-[#1E2620]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateStorySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F] mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  required
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Article Headline..."
                  className="w-full border border-[#D9D4C6] bg-[#FAF9F5] p-2.5 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F] mb-1">
                  Tag / Desk
                </label>
                <input
                  type="text"
                  required
                  value={storyTag}
                  onChange={(e) => setStoryTag(e.target.value)}
                  placeholder="e.g. Technology, Biosafety..."
                  className="w-full border border-[#D9D4C6] bg-[#FAF9F5] p-2.5 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F] mb-1">
                  Cover Photo (16:9)
                </label>
                <div className="border border-dashed border-[#D9D4C6] bg-[#EFECE6]/40 p-4 text-center">
                  {croppedPreview ? (
                    <div className="space-y-2">
                      <img
                        src={croppedPreview}
                        alt="Cropped Preview"
                        className="h-32 w-full object-cover border border-[#E2DDCF]"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#3F6B4F] underline"
                      >
                        <Crop size={12} /> Adjust Crop
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-1 py-2">
                      <ImageIcon size={22} className="text-[#7A8079]" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3F6B4F]">
                        Upload Asset
                      </span>
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
                <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F] mb-1">
                  Excerpt Summary
                </label>
                <textarea
                  rows={3}
                  required
                  value={storyExcerpt}
                  onChange={(e) => setStoryExcerpt(e.target.value)}
                  placeholder="Brief synopsis..."
                  className="w-full border border-[#D9D4C6] bg-[#FAF9F5] p-2.5 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[#E2DDCF] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-[#D9D4C6] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5A6259] hover:border-[#1E2620]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStory}
                  className="bg-[#1E2620] px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#FAF9F5] hover:bg-[#3F6B4F] disabled:opacity-50"
                >
                  {isSubmittingStory ? "Recording..." : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Viewport Modal */}
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