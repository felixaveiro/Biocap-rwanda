'use client';

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import BlogTable from "@/components/BlogTable";
import EditStoryModal from "@/components/EditStoryModal";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost, Role, User } from "@/types";
import { Plus, AlertCircle, RefreshCw, FileText, PenLine } from "lucide-react";

// ── Typography System ─────────────────────────────────────────
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

// ── Wrapper Component for Search Parameters ───────────────────
function StoryTableWrapper({
  stories,
  user,
  onRefresh,
  onEditStory,
}: {
  stories: BlogPost[];
  user: User;
  onRefresh: () => void;
  onEditStory: (story: BlogPost) => void;
}) {
  const searchParams = useSearchParams();
  const openStoryId = searchParams ? searchParams.get("open") : null;

  // Auto-open Edit Modal if URL contains ?open=STORY_ID
  useEffect(() => {
    if (openStoryId && stories.length > 0) {
      const match = stories.find((s) => s._id === openStoryId);
      if (match) {
        onEditStory(match);
      }
    }
  }, [openStoryId, stories, onEditStory]);

  return (
    <BlogTable
      blogs={stories}
      user={user}
      onRefreshNeeded={onRefresh}
      openStoryId={openStoryId}
      onEditStory={onEditStory}
    />
  );
}

export default function CreatorMyStoriesPage() {
  const {
    user: currentCreatorUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("blog:create");

  const [personalStoriesList, setPersonalStoriesList] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingStory, setEditingStory] = useState<BlogPost | null>(null);

  const fetchPersonalStories = useCallback(async () => {
    if (!currentCreatorUser) return;
    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      const creatorRole = currentCreatorUser.role as Role;
      const apiResponse = await blogsApi.getBlogs(creatorRole);

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

  const rejectedCount = personalStoriesList.filter((s) => s.status === "rejected").length;

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  if (sessionLoading || !isPermissionAllowed || !currentCreatorUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16`} style={bodyFont}>
        <Header title="My Stories" subtitle="Verifying author credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-14 w-full bg-[#E7E3D6]" />
            <div className="h-96 w-full bg-[#E7E3D6]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fontVars} min-h-screen bg-[#F3F2ED] pb-16 text-[#1E2620]`} style={bodyFont}>
      <Header
        title="My Article Catalog"
        subtitle="Track publishing status, review editor feedback, and update your draft submissions"
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Masthead Header Strip */}
        <div className="border-b border-[#D9D4C6] pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.18em] text-[#6B7268]"
                style={monoFont}
              >
                Editorial Article
              </p>
              <h1
                className="mt-1 text-2xl italic text-[#1E2620]"
                style={displayFont}
              >
                Your submissions at BioCap Rwanda
              </h1>
            </div>

            <Link
              href="/creator/my-stories/new"
              className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors duration-200 hover:bg-[#3F6B4F] hover:border-[#3F6B4F]"
            >
              <Plus size={14} strokeWidth={2.5} />
              New story
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg tabular-nums text-[#1E2620]" style={monoFont}>
                {String(personalStoriesList.length).padStart(2, "0")}
              </span>
              <span className="text-xs text-[#6B7268]">total stories</span>
            </div>

            {rejectedCount > 0 && (
              <div className="flex items-center gap-1.5 border-l border-[#D9D4C6] pl-5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A9812F]" />
                <span className="text-xs tabular-nums text-[#8A6A24]" style={monoFont}>
                  {rejectedCount}
                </span>
                <span className="text-xs text-[#6B7268]">
                  {rejectedCount > 1 ? "need revision" : "needs revision"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Feedback Alert Callout */}
        {rejectedCount > 0 && (
          <div className="flex items-start gap-3 border-l-2 border-[#A9812F] bg-[#FBF6E9] px-4 py-3.5">
            <PenLine size={16} className="mt-0.5 shrink-0 text-[#8A6A24]" />
            <div>
              <h4 className="text-xs font-semibold text-[#5C4715]">
                Editorial revisions requested
              </h4>
              <p className="mt-0.5 text-xs leading-relaxed text-[#5C4715]/80">
                You have {rejectedCount} article{rejectedCount > 1 ? "s" : ""} returned with feedback notes from the reviewer. Click <strong>Edit</strong> inside the table to inspect reviewer feedback and resubmit changes.
              </p>
            </div>
          </div>
        )}

        {/* Network Sync Error Callout */}
        {fetchErrorMessage && (
          <div className="flex items-center justify-between gap-3 border-l-2 border-[#B65C4B] bg-[#FBEEEC] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
              <p className="text-xs font-medium text-[#7A362A]">{fetchErrorMessage}</p>
            </div>
            <button
              type="button"
              onClick={fetchPersonalStories}
              className="inline-flex items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#B65C4B] transition-colors duration-200 hover:bg-[#B65C4B] hover:text-white cursor-pointer"
            >
              <RefreshCw size={12} /> Retry Sync
            </button>
          </div>
        )}

        {/* Content Table Container */}
        {isDataLoading ? (
          <div className="h-72 w-full animate-pulse border border-[#E2DDCF] bg-white" />
        ) : personalStoriesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-[#D9D4C6] bg-white px-12 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center border border-[#D9D4C6] text-[#3F6B4F]">
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-lg italic text-[#1E2620]" style={displayFont}>
              Your article catalog is empty
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#6B7268]">
              Write and submit draft articles with images and supporting materials to send them to the editorial desk.
            </p>
            <Link
              href="/creator/my-stories/new"
              className="mt-6 inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors duration-200 hover:bg-[#3F6B4F] hover:border-[#3F6B4F]"
            >
              <Plus size={14} /> Draft Your First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden border border-[#E2DDCF] bg-white">
            <Suspense fallback={<div className="p-6 text-xs text-[#6B7268]">Loading catalog table...</div>}>
              <StoryTableWrapper
                stories={personalStoriesList}
                user={currentCreatorUser}
                onRefresh={fetchPersonalStories}
                onEditStory={(story) => setEditingStory(story)}
              />
            </Suspense>
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