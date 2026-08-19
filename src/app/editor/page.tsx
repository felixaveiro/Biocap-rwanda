'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import ReviewStoryModal from "@/components/ReviewStoryModal";
import { useSession } from "@/hooks/useSession";
import { editorApi, BlogStatsResponse } from "@/lib/api/blogs";
import { BlogPost, Role } from "@/types";
import {
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Eye,
  CheckCircle,
} from "lucide-react";

// ── Type system (matches the rest of the editorial suite) ──────
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

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  if (sessionLoading || !isPermissionAllowed || !currentEditorUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16`} style={bodyFont}>
        <Header title="Communication Editor Desk" subtitle="Authenticating credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid animate-pulse grid-cols-2 divide-x divide-[#D9D4C6] border border-[#E2DDCF] bg-white sm:grid-cols-4">
            <div className="h-24 bg-[#E7E3D6]" />
            <div className="h-24 bg-[#E7E3D6]" />
            <div className="h-24 bg-[#E7E3D6]" />
            <div className="h-24 bg-[#E7E3D6]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16 text-[#1E2620]`} style={bodyFont}>
      <Header
        title="Editorial Review Desk"
        subtitle={`Welcome back, ${currentEditorUser.firstName || "Editor"}. Review submitted stories, propose edits, and approve articles for publication.`}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Masthead / nameplate */}
        <div className="pb-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#6B7268]" style={monoFont}>
            Editorial Story
          </span>
          <h1 className="mt-1.5 text-[26px] italic leading-none text-[#1E2620] sm:text-3xl" style={displayFont}>
            Good to see you, {currentEditorUser.firstName || "Editor"}
          </h1>
        </div>
        <div className="mb-8 space-y-[3px]">
          <div className="h-[2px] w-full bg-[#1E2620]" />
          <div className="h-px w-full bg-[#1E2620]" />
        </div>

        {/* Error Banner */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between gap-3 border-l-2 border-[#B65C4B] bg-[#FBEEEC] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
              <p className="text-xs font-medium text-[#7A362A]">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchEditorDashboardData}
              className="inline-flex items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#B65C4B] transition-colors hover:bg-[#B65C4B] hover:text-white"
            >
              <RefreshCw size={12} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Ledger stat row */}
        <div className="mb-8 grid grid-cols-2 divide-x divide-[#D9D4C6] border border-[#E2DDCF] bg-white sm:grid-cols-4">
          {[
            { label: "Awaiting review", value: editorMetrics.pendingReviewCount, accent: "#A9812F" },
            { label: "Approved", value: editorMetrics.approvedCount, accent: "#3F6B4F" },
            { label: "Live published", value: editorMetrics.publishedCount, accent: "#4A6E8A" },
            { label: "Total articles", value: editorMetrics.totalCount },
          ].map((s) => (
            <div key={s.label} className="px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8B9188]">{s.label}</p>
              <p
                className="mt-1 text-2xl tabular-nums"
                style={{ ...monoFont, color: s.accent ?? "#1E2620" }}
              >
                {isDataLoading ? "···" : String(s.value).padStart(2, "0")}
              </p>
            </div>
          ))}
        </div>

        {/* Pending Review Queue (FIFO) */}
        <div className="border border-[#E2DDCF] bg-white p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-[#EDEAE0] pb-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#1E2620]">
                <Clock size={16} className="text-[#A9812F]" /> Priority review queue
              </h3>
              <p className="mt-0.5 text-xs text-[#6B7268]">
                Submissions pending editorial review, ordered by submission date (FIFO).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/editor/review"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3F6B4F] transition-colors hover:text-[#1E2620]"
              >
                Full queue catalog <ArrowRight size={13} />
              </Link>
              <Link
                href="/editor/manage"
                className="inline-flex items-center gap-1.5 border-l border-[#D9D4C6] pl-4 text-xs font-semibold text-[#3F6B4F] transition-colors hover:text-[#1E2620]"
              >
                Full editor catalog <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {reviewQueueList.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-[#D9D4C6] px-8 py-12 text-center">
              <CheckCircle size={22} strokeWidth={1.5} className="text-[#3F6B4F]" />
              <p className="mt-3 text-xs text-[#6B7268]">
                The review queue is currently empty. All submitted stories have been processed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDEAE0]">
              {reviewQueueList.slice(0, 5).map((story) => (
                <div
                  key={story._id}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-[#FAF9F5]"
                >
                  <div className="min-w-0 space-y-1.5">
                    <span
                      className="inline-block border border-[#E7CE94] bg-[#FBF6E9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A6A24]"
                    >
                      Pending review
                    </span>
                    <h4 className="truncate text-sm font-semibold text-[#1E2620]">{story.title}</h4>
                    <p className="line-clamp-1 text-xs text-[#8B9188]">
                      {story.excerpt || "No excerpt provided."}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedStoryForModal(story)}
                    className="inline-flex shrink-0 items-center gap-1.5 border border-[#1E2620] bg-[#1E2620] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F]"
                  >
                    <Eye size={13} /> Review
                  </button>
                </div>
              ))}
            </div>
          )}
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