'use client';

import { useEffect, useState, useCallback } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
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

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  if (sessionLoading || !isPermissionAllowed || !currentEditorUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16`} style={bodyFont}>
        <Header title="Editor Review Queue" subtitle="Verifying credentials…" />
        <div className="p-8 text-sm text-[#6B7268]">Loading queue…</div>
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
            Editorial desk
          </span>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <h1 className="text-[26px] italic leading-none text-[#1E2620] sm:text-3xl" style={displayFont}>
              Waiting on your read
            </h1>
            {!isDataLoading && (
              <span className="text-sm tabular-nums text-[#6B7268]" style={monoFont}>
                {String(reviewQueue.length).padStart(2, "0")} in queue
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
      </main>
    </div>
  );
}