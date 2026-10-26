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
  PenTool,
  BookOpen,
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

  const fetchMyStories = useCallback(async () => {
    if (!currentCreatorUser) return;
    setIsDataFetching(true);
    setFetchErrorMessage(null);

    try {
      const creatorRole = currentCreatorUser.role as Role;
      const apiResponse = await blogsApi.getBlogs(creatorRole);

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

  const creatorMetrics = useMemo(() => {
    const totalCount = myStoriesList.length;

    const pendingReviewCount = myStoriesList.filter(
      (story) => (story.status as string) === "submitted" || (story.status as string) === "pending_review"
    ).length;

    const approvedCount = myStoriesList.filter(
      (story) => (story.status as string) === "approved"
    ).length;

    const publishedCount = myStoriesList.filter(
      (story) => (story.status as string) === "published"
    ).length;

    return { totalCount, pendingReviewCount, approvedCount, publishedCount };
  }, [myStoriesList]);

  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };

  if (sessionLoading || !isPermissionAllowed || !currentCreatorUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] pb-16 font-sans">
        <Header title="Creator Hub" subtitle="Verifying author permissions…" />
        <div className="mx-auto max-w-7xl px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-5 sm:grid-cols-4">
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-44 bg-[#EFECE6]" />
              <div className="h-44 bg-[#EFECE6]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]">
      <Header
        title="Content Creator Workspace"
        subtitle={`Welcome back, ${currentCreatorUser.firstName || "Author"}. Ready to craft your next article?`}
      />

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Connection Error Banner */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} />
              <p className="text-xs font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchMyStories}
              className="inline-flex items-center gap-1.5 border border-[#8B4136]/30 bg-[#FAF9F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5]"
              style={monoFont}
            >
              <RefreshCw size={12} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Story Metric Cards */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#FAF9F5] border-t-2 border-[#1E2620] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                My Portfolio
              </span>
              <FileText size={16} className="text-[#3F6B4F]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : creatorMetrics.totalCount}
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#A9812F] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                In Review
              </span>
              <Clock size={16} className="text-[#A9812F]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : creatorMetrics.pendingReviewCount}
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#3F6B4F] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Approved
              </span>
              <CheckCircle2 size={16} className="text-[#3F6B4F]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : creatorMetrics.approvedCount}
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#1E2620] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Live Published
              </span>
              <Globe size={16} className="text-[#1E2620]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataFetching ? "…" : creatorMetrics.publishedCount}
            </p>
          </div>
        </div>

        {/* Creator Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* New Article Box */}
          <div className="border border-[#E2DDCF] bg-[#FAF9F5] p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PenTool size={16} className="text-[#3F6B4F]" />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                  style={monoFont}
                >
                  Publishing Desk
                </span>
              </div>
              <h3 className="text-xl font-serif italic text-[#1E2620]" style={displayFont}>
                Compose New Article
              </h3>
              <p className="text-xs leading-relaxed text-[#5A6259]">
                Draft your article, crop cover photos, attach section media, and send your manuscript directly to the editorial desk for review.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E2DDCF]">
              <Link
                href="/creator/my-stories/new"
                className="inline-flex items-center gap-2 bg-[#1E2620] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#FAF9F5] transition-colors hover:bg-[#3F6B4F]"
                style={monoFont}
              >
                <Plus size={14} /> Draft New Story
              </Link>
            </div>
          </div>

          {/* Catalog Management Box */}
          <div className="border border-[#E2DDCF] bg-[#FAF9F5] p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#A9812F]" />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                  style={monoFont}
                >
                  Archive &amp; Revision
                </span>
              </div>
              <h3 className="text-xl font-serif italic text-[#1E2620]" style={displayFont}>
                Manage My Catalog
              </h3>
              <p className="text-xs leading-relaxed text-[#5A6259]">
                Inspect editorial feedback, address change requests, update draft text, and track your submissions as they progress toward live publication.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E2DDCF]">
              <Link
                href="/creator/my-stories"
                className="inline-flex items-center gap-2 border border-[#D9D4C6] bg-[#FAF9F5] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1E2620] transition-colors hover:border-[#1E2620] hover:text-[#3F6B4F]"
                style={monoFont}
              >
                View My Catalog <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}