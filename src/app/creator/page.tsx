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
  Globe,
  Plus,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function CreatorOverviewDashboardPage() {
  const {
    user: currentCreatorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:create");

  const [myStoriesList, setMyStoriesList] = useState<BlogPost[]>([]);
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Wrapped in useCallback for clean React Hook dependency tracking
  const fetchMyStories = useCallback(async () => {
    if (!currentCreatorUser) return;
    setIsDataFetching(true);
    setFetchErrorMessage(null);

    try {
      const creatorRole = currentCreatorUser.role as Role;
      const apiResponse: any = await blogsApi.getBlogs(creatorRole);

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(apiResponse)) extractedBlogs = apiResponse;
      else if (Array.isArray(apiResponse?.data)) extractedBlogs = apiResponse.data;
      else if (Array.isArray(apiResponse?.docs)) extractedBlogs = apiResponse.docs;

      setMyStoriesList(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to load personal creator stories:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load your story metrics.";
      setFetchErrorMessage(errorMessage);
    } finally {
      setIsDataFetching(false);
    }
  }, [currentCreatorUser]);

  useEffect(() => {
    if (currentCreatorUser && isPermissionAllowed) {
      fetchMyStories();
    }
  }, [currentCreatorUser, isPermissionAllowed, fetchMyStories]);

  // Compute story summary stats for the current creator
  const creatorMetrics = useMemo(() => {
    const totalCount = myStoriesList.length;

    const pendingReviewCount = myStoriesList.filter(
      (story) => (story.status as string) === "submitted" || (story.status as string) === "pending"
    ).length;

    const approvedCount = myStoriesList.filter(
      (story) => (story.status as string) === "approved"
    ).length;

    const publishedCount = myStoriesList.filter(
      (story) => (story.status as string) === "published"
    ).length;

    return { totalCount, pendingReviewCount, approvedCount, publishedCount };
  }, [myStoriesList]);

  if (sessionLoading || !isPermissionAllowed || !currentCreatorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Creator Hub" subtitle="Verifying author permissions…" />
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
        title="Content Creator Workspace"
        subtitle={`Welcome back, ${currentCreatorUser.firstName || "Author"}. Ready to write your next story?`}
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
              onClick={fetchMyStories}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Story Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                My Total Stories
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataFetching ? "…" : creatorMetrics.totalCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                In Review
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataFetching ? "…" : creatorMetrics.pendingReviewCount}
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
                {isDataFetching ? "…" : creatorMetrics.approvedCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Globe size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Published
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataFetching ? "…" : creatorMetrics.publishedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Creator Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create New Article</h3>
            <p className="text-xs text-slate-500 mb-4">
              Draft your story, attach cover images, and send it directly to editors for review.
            </p>
            <Link
              href="/creator/my-stories/new"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <Plus size={14} /> Draft New Story
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Manage My Submissions</h3>
            <p className="text-xs text-slate-500 mb-4">
              View review notes, update drafts, or edit your submitted articles.
            </p>
            <Link
              href="/creator/my-stories"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              View My Stories <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}