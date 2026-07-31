'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BlogTable from "../../../components/BlogTable";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";

export default function CreatorMyStoriesPage() {
  const {
    user: currentCreatorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:create");

  const [personalStoriesList, setPersonalStoriesList] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  const fetchPersonalStories = useCallback(async () => {
    if (!currentCreatorUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      const creatorRole = currentCreatorUser.role as Role;
      const apiResponse: any = await blogsApi.getBlogs(creatorRole);

      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(apiResponse)) extractedBlogs = apiResponse;
      else if (Array.isArray(apiResponse?.data)) extractedBlogs = apiResponse.data;
      else if (Array.isArray(apiResponse?.docs)) extractedBlogs = apiResponse.docs;

      setPersonalStoriesList(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to fetch personal story list:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load your personal articles.";
      setFetchErrorMessage(errorMessage);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentCreatorUser]);

  useEffect(() => {
    if (currentCreatorUser && isPermissionAllowed) {
      fetchPersonalStories();
    }
  }, [currentCreatorUser, isPermissionAllowed, fetchPersonalStories]);

  if (sessionLoading || !isPermissionAllowed || !currentCreatorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="My Stories" subtitle="Verifying author permissions…" />
        <div className="p-8 text-sm text-slate-400">Loading stories…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="My Article Catalog"
        subtitle="Track status, review editor feedback, and update your personal drafts"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Link
            href="/creator/my-stories/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Plus size={16} />
            Create New Story
          </Link>
        </div>

        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchPersonalStories}
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
              blogs={personalStoriesList}
              user={currentCreatorUser}
              onRefreshNeeded={fetchPersonalStories}
            />
          </div>
        )}
      </main>
    </div>
  );
}