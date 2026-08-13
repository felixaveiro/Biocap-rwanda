'use client';

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import EditStoryModal from "@/components/EditStoryModal";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role } from "@/types";
import { Plus, AlertCircle, RefreshCw, FileText, Sparkles, MessageSquare } from "lucide-react";

export default function CreatorMyStoriesPage() {
  const {
    user: currentCreatorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:create");

  const [personalStoriesList, setPersonalStoriesList] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Edit Modal State
  const [editingStory, setEditingStory] = useState<BlogPost | null>(null);

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

  // Check if any articles have rejection notes needing attention
  const rejectedCount = personalStoriesList.filter((s) => s.status === "rejected").length;

  if (sessionLoading || !isPermissionAllowed || !currentCreatorUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="My Stories" subtitle="Verifying author credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-14 w-full rounded-2xl bg-slate-200" />
            <div className="h-96 w-full rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="My Article Catalog"
        subtitle="Track publishing status, review editor feedback, and update your draft submissions"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Action Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              <Sparkles size={13} /> {personalStoriesList.length} Total Stories
            </span>
            {rejectedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                <MessageSquare size={13} /> {rejectedCount} Needs Revision
              </span>
            )}
          </div>

          <Link
            href="/creator/my-stories/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={16} />
            Create New Story
          </Link>
        </div>

        {/* Rejection Alert Callout */}
        {rejectedCount > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-xs">
            <MessageSquare size={18} className="mt-0.5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">Editorial Revisions Requested</h4>
              <p className="mt-0.5 text-xs text-amber-800/90 leading-relaxed">
                You have {rejectedCount} article{rejectedCount > 1 ? "s" : ""} returned with feedback notes from the reviewer. Click <strong>Edit</strong> inside the table to inspect reviewer feedback and resubmit changes.
              </p>
            </div>
          </div>
        )}

        {/* Sync Error Callout */}
        {fetchErrorMessage && (
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              type="button"
              onClick={fetchPersonalStories}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} /> Retry Sync
            </button>
          </div>
        )}

        {/* Content Table or Empty State */}
        {isDataLoading ? (
          <div className="h-72 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ) : personalStoriesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Your article catalog is empty</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Write and submit draft articles with images and supporting materials to send them to the editorial desk.
            </p>
            <Link
              href="/creator/my-stories/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <Plus size={16} /> Draft Your First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <BlogTable
              blogs={personalStoriesList}
              user={currentCreatorUser}
              onRefreshNeeded={fetchPersonalStories}
              openStoryId={searchParams.get("open")}
            />
          </div>
        )}
      </main>

      {/* Edit Story Draft Modal */}
      {editingStory && (
        <EditStoryModal
          story={editingStory}
          currentUserRole={currentCreatorUser.role as Role}
          onClose={() => setEditingStory(null)}
          onStoryUpdated={fetchPersonalStories}
        />
      )}
    </div>
  );
}