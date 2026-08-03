'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import {
  Trash2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ArchiveX,
} from "lucide-react";

export default function OfficerTrashPage() {
  const { user: currentOfficerUser, loading: sessionLoading, allowed } = useSession("blog:view");

  const [trashedBlogs, setTrashedBlogs] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyArticleId, setBusyArticleId] = useState<string | null>(null);

  // ─── Fetch Trashed Articles ────────────────────────────────────────────────

  const fetchTrashItems = useCallback(async () => {
    if (!currentOfficerUser) return;
    setIsDataLoading(true);
    setFetchError(null);

    try {
      const officerRole = currentOfficerUser.role as Role;
      const apiResponse = await blogsApi.getDeletedBlogs(officerRole);

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(apiResponse)) {
        extractedBlogs = apiResponse;
      } else if (apiResponse && Array.isArray(apiResponse.data)) {
        extractedBlogs = apiResponse.data;
      }

      setTrashedBlogs(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to load trashed articles:", error);
      const msg = error instanceof Error ? error.message : "Failed to load trashed articles.";
      setFetchError(msg);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentOfficerUser]);

  useEffect(() => {
    if (currentOfficerUser && allowed) {
      fetchTrashItems();
    }
  }, [currentOfficerUser, allowed, fetchTrashItems]);

  // ─── Restore Article Handler ───────────────────────────────────────────────

  const handleRestore = async (id: string) => {
    if (!currentOfficerUser) return;
    setBusyArticleId(id);
    setActionError(null);

    try {
      const officerRole = currentOfficerUser.role as Role;
      await blogsApi.restoreBlog(id, officerRole);
      await fetchTrashItems();
    } catch (err: unknown) {
      console.error("Failed to restore article:", err);
      const msg = err instanceof Error ? err.message : "Failed to restore article.";
      setActionError(msg);
    } finally {
      setBusyArticleId(null);
    }
  };

  // ─── Permanent Delete Handler ─────────────────────────────────────────────

  const handlePermanentDelete = async (id: string) => {
    if (!currentOfficerUser) return;

    const confirmed = window.confirm(
      "CRITICAL: Are you sure you want to permanently wipe this story? This action cannot be undone and will destroy associated Cloudinary media assets."
    );
    if (!confirmed) return;

    setBusyArticleId(id);
    setActionError(null);

    try {
      const officerRole = currentOfficerUser.role as Role;
      await blogsApi.permanentDeleteBlog(id, officerRole);
      await fetchTrashItems();
    } catch (err: unknown) {
      console.error("Failed to permanently wipe article:", err);
      const msg = err instanceof Error ? err.message : "Failed to permanently wipe article.";
      setActionError(msg);
    } finally {
      setBusyArticleId(null);
    }
  };

  // ─── Authentication Loading & Protection ───────────────────────────────────

  if (sessionLoading || !allowed || !currentOfficerUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Trash Bin" subtitle="Verifying credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-24 w-full rounded-2xl bg-slate-200/80" />
            <div className="h-96 w-full rounded-2xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Officer Trash Bin"
        subtitle="Restore soft-deleted stories back to active publishing queues or permanently wipe content assets"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Warning Callout Box */}
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Soft-Deleted Content Vault</h4>
            <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
              Articles in this trash bin are hidden from creators and public feeds. Restoring an article will place it back in your active publishing management list. Wiping an article is non-reversible and destroys all associated server files and Cloudinary images.
            </p>
          </div>
        </div>

        {/* Action Error Alert */}
        {actionError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-xs">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Fetch Error Alert */}
        {fetchError && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchError}</p>
            </div>
            <button
              type="button"
              onClick={fetchTrashItems}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} /> Retry Sync
            </button>
          </div>
        )}

        {/* Trash Content Section */}
        {isDataLoading ? (
          <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ) : trashedBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mb-4">
              <ArchiveX size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Trash bin is currently empty</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              No soft-deleted articles found. Soft-deleted content from the publishing desk will appear here.
            </p>
            <button
              type="button"
              onClick={fetchTrashItems}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <RefreshCw size={14} /> Refresh Trash
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <BlogTable
              blogs={trashedBlogs}
              user={currentOfficerUser}
              showTrash={true}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onRefreshNeeded={fetchTrashItems}
            />
          </div>
        )}
      </main>
    </div>
  );
}