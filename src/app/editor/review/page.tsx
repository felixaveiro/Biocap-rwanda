'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function EditorReviewQueuePage() {
  const {
    user: currentEditorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:view");

  const [reviewQueue, setReviewQueue] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  const fetchReviewQueue = useCallback(async () => {
    if (!currentEditorUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      // Fetch articles pending review for the editor
      const response = await blogsApi.getBlogs("editor", { status: "pending_review" });

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(response)) {
        extractedBlogs = response;
      } else if (response && Array.isArray((response as any).data)) {
        extractedBlogs = (response as any).data;
      }

      setReviewQueue(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to fetch editor review queue:", error);
      const msg = error instanceof Error ? error.message : "Failed to load review queue.";
      setFetchErrorMessage(msg);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentEditorUser]);

  useEffect(() => {
    if (currentEditorUser && isPermissionAllowed) {
      fetchReviewQueue();
    }
  }, [currentEditorUser, isPermissionAllowed, fetchReviewQueue]);

  if (sessionLoading || !isPermissionAllowed || !currentEditorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Editor Review Queue" subtitle="Verifying credentials…" />
        <div className="p-8 text-sm text-slate-400">Loading queue…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Editor Review Queue"
        subtitle="Review story submissions, make content or layout modifications, and approve articles for final publishing."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchReviewQueue}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <RefreshCw size={13} /> Retry Sync
            </button>
          </div>
        )}

        {isDataLoading ? (
          <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <BlogTable
              blogs={reviewQueue}
              user={currentEditorUser}
              onRefreshNeeded={fetchReviewQueue}
            />
          </div>
        )}
      </main>
    </div>
  );
}