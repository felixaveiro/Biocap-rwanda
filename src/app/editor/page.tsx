'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function EditorOverviewPage() {
  const {
    user: currentEditorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:view");

  const [assignedArticlesList, setAssignedArticlesList] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Wrapped in useCallback for clean React Hook dependency tracking
  const fetchEditorArticles = useCallback(async () => {
    if (!currentEditorUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      const editorRole = currentEditorUser.role as Role;
      const apiResponse: any = await blogsApi.getBlogs(editorRole);

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(apiResponse)) extractedBlogs = apiResponse;
      else if (Array.isArray(apiResponse?.data)) extractedBlogs = apiResponse.data;
      else if (Array.isArray(apiResponse?.docs)) extractedBlogs = apiResponse.docs;

      setAssignedArticlesList(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to fetch articles for review:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load review queue metrics.";
      setFetchErrorMessage(errorMessage);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentEditorUser]);

  useEffect(() => {
    if (currentEditorUser && isPermissionAllowed) {
      fetchEditorArticles();
    }
  }, [currentEditorUser, isPermissionAllowed, fetchEditorArticles]);

  // Compute review statistics
  const editorMetrics = useMemo(() => {
    const totalCount = assignedArticlesList.length;

    const pendingReviewCount = assignedArticlesList.filter(
      (story) => (story.status as string) === "submitted" || (story.status as string) === "pending"
    ).length;

    const approvedCount = assignedArticlesList.filter(
      (story) => (story.status as string) === "approved"
    ).length;

    const rejectedCount = assignedArticlesList.filter(
      (story) => (story.status as string) === "rejected"
    ).length;

    return { totalCount, pendingReviewCount, approvedCount, rejectedCount };
  }, [assignedArticlesList]);

  if (sessionLoading || !isPermissionAllowed || !currentEditorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Editor Desk" subtitle="Authenticating credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Editorial Review Desk"
        subtitle={`Welcome back, ${currentEditorUser.firstName || "Editor"}. Here is your current review queue.`}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Connection Error Banner */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchEditorArticles}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assigned Articles
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : editorMetrics.totalCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Awaiting Review
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : editorMetrics.pendingReviewCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Approved
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : editorMetrics.approvedCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Requested Changes
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : editorMetrics.rejectedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Articles Review Queue</h3>
          <p className="text-xs text-slate-500 mb-4">
            Review articles submitted by content creators, approve well-written posts, or send revision requests.
          </p>
          <Link
            href="/editor/review"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            Open Review Desk <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}