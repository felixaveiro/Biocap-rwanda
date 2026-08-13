'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ReviewStoryModal from "@/components/ReviewStoryModal";
import { useSession } from "@/hooks/useSession";
import { editorApi, BlogStatsResponse } from "@/lib/api/blogs";
import { BlogPost, Role } from "@/types";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function EditorOverviewPage() {
  const {
    user: currentEditorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:view");

  const [blogStats, setBlogStats] = useState<BlogStatsResponse | null>(null);
  const [reviewQueueList, setReviewQueueList] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Modal State for inspecting/reviewing a story
  const [selectedStoryForModal, setSelectedStoryForModal] = useState<BlogPost | null>(null);

  // Fetch Editor Dashboard Metrics and Review Queue
  const fetchEditorDashboardData = useCallback(async () => {
    if (!currentEditorUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      const [statsResponse, queueResponse] = await Promise.all([
        editorApi.getBlogStats(),
        editorApi.getReviewQueue(),
      ]);

      setBlogStats(statsResponse);

      let extractedQueue: BlogPost[] = [];
      if (Array.isArray(queueResponse)) {
        extractedQueue = queueResponse;
      } else if (queueResponse && Array.isArray((queueResponse as any).data)) {
        extractedQueue = (queueResponse as any).data;
      }

      setReviewQueueList(extractedQueue);
    } catch (error: unknown) {
      console.error("Failed to fetch Editor workspace data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load review queue metrics.";
      setFetchErrorMessage(errorMessage);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentEditorUser]);

  useEffect(() => {
    if (currentEditorUser && isPermissionAllowed) {
      fetchEditorDashboardData();
    }
  }, [currentEditorUser, isPermissionAllowed, fetchEditorDashboardData]);

  // Compute metrics with fallbacks
  const editorMetrics = useMemo(() => {
    return {
      pendingReviewCount: blogStats?.pending_review || 0,
      approvedCount: blogStats?.approved || 0,
      publishedCount: blogStats?.published || 0,
      totalCount: blogStats?.total || 0,
      draftCount: blogStats?.draft || 0,
    };
  }, [blogStats]);

  if (sessionLoading || !isPermissionAllowed || !currentEditorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Communication Editor Desk" subtitle="Authenticating credentials…" />
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
        subtitle={`Welcome back, ${currentEditorUser.firstName || "Editor"}. Review submitted stories, propose edits, and approve articles for publication.`}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Banner */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchEditorDashboardData}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Published
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : editorMetrics.publishedCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Articles
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataLoading ? "…" : editorMetrics.totalCount}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Review Queue (FIFO) */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-indigo-600" /> Priority Review Queue (FIFO)
                </h3>
                <p className="text-xs text-slate-500">
                  Submissions pending editorial review, ordered by submission date.
                </p>
              </div>
              <Link
                href="/editor/review"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Full Queue Catalog <ArrowRight size={13} />
              </Link>
              <Link
                href="/editor/manage"
                className="ml-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Full Editor Catalog <ArrowRight size={13} />
              </Link>
            </div>

            {reviewQueueList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                The review queue is currently empty. All submitted stories have been processed!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviewQueueList.slice(0, 5).map((story) => (
                  <div
                    key={story._id}
                    className="flex items-center justify-between py-3.5 transition hover:bg-slate-50/50 px-2 rounded-xl"
                  >
                    <div className="space-y-1">
                      <span className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                        Pending Review
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{story.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {story.excerpt || "No excerpt provided."}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedStoryForModal(story)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                    >
                      <Eye size={13} /> Review Submission
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {selectedStoryForModal && (
        <ReviewStoryModal
          story={selectedStoryForModal}
          currentUserRole={currentEditorUser.role as Role}
          onClose={() => setSelectedStoryForModal(null)}
          onReviewCompleted={() => {
            setSelectedStoryForModal(null);
            fetchEditorDashboardData();
          }}
        />
      )}
    </div>
  );
}