'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi, officerApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import { AlertCircle, RefreshCw, Globe, CheckCircle2, FileText } from "lucide-react";

export default function OfficerPublishingDeskPage() {
  const {
    user: currentOfficerUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:view");

  const [publishingQueueList, setPublishingQueueList] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  const fetchPublishingQueue = useCallback(async () => {
    if (!currentOfficerUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      // Fetch published articles using dedicated officer endpoint (/api/officer/published)
      const apiResponse = await officerApi.getPublishedBlogs();

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(apiResponse)) {
        extractedBlogs = apiResponse;
      } else if (apiResponse && Array.isArray((apiResponse as any).data)) {
        extractedBlogs = (apiResponse as any).data;
      }

      setPublishingQueueList(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to load publishing queue:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load publishing queue.";
      setFetchErrorMessage(errorMessage);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentOfficerUser]);

  useEffect(() => {
    if (currentOfficerUser && isPermissionAllowed) {
      fetchPublishingQueue();
    }
  }, [currentOfficerUser, isPermissionAllowed, fetchPublishingQueue]);

  // Accepts BlogPost | string to match BlogTable's onPublish prop
  const handlePublishArticle = async (target: BlogPost | string) => {
    if (!currentOfficerUser) return;

    const articleId = typeof target === "string" ? target : target._id;

    try {
      await blogsApi.publishBlog(articleId, currentOfficerUser.role as Role);
      await fetchPublishingQueue();
    } catch (error) {
      console.error("Failed to publish article live:", error);
    }
  };

  // Accepts BlogPost | string to match BlogTable's onUnpublish prop
  const handleUnpublishArticle = async (target: BlogPost | string) => {
    if (!currentOfficerUser) return;

    const articleId = typeof target === "string" ? target : target._id;

    try {
      await blogsApi.unpublishBlog(articleId, {}, currentOfficerUser.role as Role);
      await fetchPublishingQueue();
    } catch (error) {
      console.error("Failed to unpublish article:", error);
    }
  };

  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };

  if (sessionLoading || !isPermissionAllowed || !currentOfficerUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] pb-16 font-sans">
        <Header title="Publishing Desk" subtitle="Verifying credentials…" />
        <div className="mx-auto max-w-7xl px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
              <div className="h-24 bg-[#EFECE6]" />
            </div>
            <div className="h-96 w-full bg-[#EFECE6]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]">
      <Header
        title="Live Publishing Desk"
        subtitle="Manage active public articles and release approved creator manuscripts to the live website"
      />

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Metric Overview Strip */}
        <div className="mb-10 grid gap-5 sm:grid-cols-3">
          <div className="bg-[#FAF9F5] border-t-2 border-[#1E2620] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Live Catalog
              </span>
              <Globe size={16} className="text-[#1E2620]" />
            </div>
            <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
              {isDataLoading ? "…" : publishingQueueList.length}
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#3F6B4F] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Desk Status
              </span>
              <CheckCircle2 size={16} className="text-[#3F6B4F]" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#5A6259]">
              Officer active. Ready to approve or withdraw live articles.
            </p>
          </div>

          <div className="bg-[#FAF9F5] border-t-2 border-[#A9812F] border-b border-x border-[#E2DDCF] p-5">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                style={monoFont}
              >
                Publication Protocol
              </span>
              <FileText size={16} className="text-[#A9812F]" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#5A6259]">
              All items in this desk match live public records.
            </p>
          </div>
        </div>

        {/* Connection Error Banner */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} />
              <p className="text-xs font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchPublishingQueue}
              className="inline-flex items-center gap-1.5 border border-[#8B4136]/30 bg-[#FAF9F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5]"
              style={monoFont}
            >
              <RefreshCw size={12} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Table Container */}
        {isDataLoading ? (
          <div className="h-64 w-full animate-pulse border border-[#E2DDCF] bg-[#EFECE6]" />
        ) : (
          <div className="border border-[#E2DDCF] bg-[#FAF9F5]">
            <BlogTable
              blogs={publishingQueueList}
              user={currentOfficerUser}
              onPublish={handlePublishArticle}
              onUnpublish={handleUnpublishArticle}
              onRefreshNeeded={fetchPublishingQueue}
            />
          </div>
        )}
      </main>
    </div>
  );
}