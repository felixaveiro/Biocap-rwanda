'use client';

import { useEffect, useState, useCallback } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { editorApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost } from "@/types";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

// ── Type system (matches My Stories / Create Story / Editor Catalog) ──
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

// ── Palette — canvas #F3F2ED · ink #1E2620 · moss #3F6B4F · gold #A9812F · clay #B65C4B · line #D9D4C6

const QUEUE_PAGE_SIZE = 20;

export default function EditorReviewQueuePage() {
  const {
    user: currentEditorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:view");

  const [reviewQueue, setReviewQueue] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInQueue, setTotalInQueue] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Same endpoint and oldest-first order as the overview's priority queue, so both pages list the same stories.
  const fetchReviewQueue = useCallback(async () => {
    if (!currentEditorUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      const response = await editorApi.getReviewQueue({ page, limit: QUEUE_PAGE_SIZE });

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(response)) {
        extractedBlogs = response;
        setTotalInQueue(response.length);
        setTotalPages(1);
      } else {
        extractedBlogs = response?.data ?? [];
        setTotalInQueue(response?.pagination?.total ?? extractedBlogs.length);
        setTotalPages(Math.max(response?.pagination?.totalPages ?? 1, 1));
      }

      // A decision can empty the last page, so step back to the previous page.
      if (extractedBlogs.length === 0 && page > 1) {
        setPage((current) => current - 1);
        return;
      }

      setReviewQueue(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to fetch editor review queue:", error);
      const msg = error instanceof Error ? error.message : "Failed to load review queue.";
      setFetchErrorMessage(msg);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentEditorUser, page]);

  useEffect(() => {
    if (currentEditorUser && isPermissionAllowed) {
      fetchReviewQueue();
    }
  }, [currentEditorUser, isPermissionAllowed, fetchReviewQueue]);

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  if (sessionLoading || !isPermissionAllowed || !currentEditorUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16`} style={bodyFont}>
        <Header title="Editor Review Queue" subtitle="Verifying credentials…" />
        <div className="p-8 text-sm text-[#6B7268]">
          {!sessionLoading && !isPermissionAllowed
            ? "You do not have access to the review queue. Redirecting…"
            : "Loading queue…"}
        </div>
      </div>
    );
  }

  return (
    <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16 text-[#1E2620]`} style={bodyFont}>
      <Header
        title="Editor Review Queue"
        subtitle="Review story submissions, make content or layout modifications, and approve articles for final publishing."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Masthead / nameplate */}
        <div className="pb-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#6B7268]" style={monoFont}>
            Editorial Story
          </span>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <h1 className="text-[26px] italic leading-none text-[#1E2620] sm:text-3xl" style={displayFont}>
              Waiting on your read
            </h1>
            {!isDataLoading && (
              <span className="text-sm tabular-nums text-[#6B7268]" style={monoFont}>
                {String(totalInQueue).padStart(2, "0")} in queue
              </span>
            )}
          </div>
        </div>
        <div className="mb-8 space-y-[3px]">
          <div className="h-[2px] w-full bg-[#1E2620]" />
          <div className="h-px w-full bg-[#1E2620]" />
        </div>

        {/* Sync Error Callout */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between gap-3 border-l-2 border-[#B65C4B] bg-[#FBEEEC] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
              <p className="text-xs font-medium text-[#7A362A]">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchReviewQueue}
              className="inline-flex items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#B65C4B] transition-colors hover:bg-[#B65C4B] hover:text-white"
            >
              <RefreshCw size={12} /> Retry Sync
            </button>
          </div>
        )}

        {isDataLoading ? (
          <div className="h-64 w-full animate-pulse border border-[#E2DDCF] bg-white" />
        ) : reviewQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-[#D9D4C6] bg-white px-12 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D9D4C6] text-[#3F6B4F]">
              <Inbox size={22} strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-lg italic text-[#1E2620]" style={displayFont}>
              The queue is clear
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#6B7268]">
              Nothing is waiting on your review right now. New submissions will land here as soon as writers send them in.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-[#E2DDCF] bg-white">
            <BlogTable
              blogs={reviewQueue}
              user={currentEditorUser}
              onRefreshNeeded={fetchReviewQueue}
            />
          </div>
        )}

        {!isDataLoading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-xs text-[#6B7268]" style={monoFont}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="border border-[#D9D4C6] bg-white px-3 py-1.5 font-semibold uppercase tracking-wide text-[#1E2620] transition-colors hover:bg-[#1E2620] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1E2620] cursor-pointer"
            >
              Previous
            </button>
            <span className="tabular-nums">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="border border-[#D9D4C6] bg-white px-3 py-1.5 font-semibold uppercase tracking-wide text-[#1E2620] transition-colors hover:bg-[#1E2620] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1E2620] cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}