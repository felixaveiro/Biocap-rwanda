'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function EditorReviewDeskPage() {
  const {
    user: currentEditorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:view");

  const [reviewArticlesList, setReviewArticlesList] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  const fetchSubmissionsForReview = useCallback(async () => {
    if (!currentEditorUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      const editorRole = currentEditorUser.role as Role;
      const apiResponse = await blogsApi.getBlogs(editorRole);

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(apiResponse)) {
        extractedBlogs = apiResponse;
      } else if (apiResponse && Array.isArray(apiResponse.data)) {
        extractedBlogs = apiResponse.data;
      }

      setReviewArticlesList(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to fetch review articles:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load review queue.";
      setFetchErrorMessage(errorMessage);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentEditorUser]);

  useEffect(() => {
    if (currentEditorUser && isPermissionAllowed) {
      fetchSubmissionsForReview();
    }
  }, [currentEditorUser, isPermissionAllowed, fetchSubmissionsForReview]);

  const handleApproveArticle = async (targetArticleId: string) => {
    if (!currentEditorUser) return;
    try {
      await blogsApi.approveBlog(targetArticleId, currentEditorUser.role as Role);
      await fetchSubmissionsForReview();
    } catch (error) {
      console.error("Failed to approve article:", error);
    }
  };

  const handleRejectArticle = async (targetArticleId: string, revisionNote?: string) => {
    if (!currentEditorUser) return;
    try {
      // ✅ FIX: Order must be (id, note, role)
      await blogsApi.rejectBlog(
        targetArticleId,
        revisionNote || "Revisions required.",
        currentEditorUser.role as Role
      );
      await fetchSubmissionsForReview();
    } catch (error) {
      console.error("Failed to reject article:", error);
    }
  };

  if (sessionLoading || !isPermissionAllowed || !currentEditorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Review Desk" subtitle="Verifying editor credentials…" />
        <div className="p-8 text-sm text-slate-400">Loading articles…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Submissions Review Queue"
        subtitle="Inspect creator drafts, leave feedback notes, and grant publication approvals"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchSubmissionsForReview}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry Sync
            </button>
          </div>
        )}

        {isDataLoading ? (
          <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <BlogTable
              blogs={reviewArticlesList}
              user={currentEditorUser}
              onApprove={handleApproveArticle}
              onReject={handleRejectArticle}
              onRefreshNeeded={fetchSubmissionsForReview}
            />
          </div>
        )}
      </main>
    </div>
  );
}