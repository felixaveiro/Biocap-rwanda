'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import { AlertCircle, RefreshCw } from "lucide-react";

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
      const officerRole = currentOfficerUser.role as Role;
      const apiResponse = await blogsApi.getBlogs(officerRole);

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(apiResponse)) {
        extractedBlogs = apiResponse;
      } else if (apiResponse && Array.isArray(apiResponse.data)) {
        extractedBlogs = apiResponse.data;
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

  // ✅ Fixed signature: Accepts BlogPost | string to match BlogTable's onPublish prop
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

  // ✅ Fixed signature: Accepts BlogPost | string to match BlogTable's onUnpublish prop
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

  if (sessionLoading || !isPermissionAllowed || !currentOfficerUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Publishing Desk" subtitle="Verifying credentials…" />
        <div className="p-8 text-sm text-slate-400">Loading queue…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Live Publishing Desk"
        subtitle="Manage live articles and release approved creator stories to the public website"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchPublishingQueue}
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