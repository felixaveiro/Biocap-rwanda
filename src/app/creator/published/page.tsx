'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost } from "@/types";
import { Globe, RefreshCw, AlertCircle, Eye, Tag, Calendar, User as UserIcon } from "lucide-react";

export default function CreatorPublishedFeedPage() {
  const { user, loading: sessionLoading, allowed } = useSession("blog:view");

  const [publishedBlogs, setPublishedBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPublishedFeed = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response: any = await blogsApi.getCreatorPublishedFeed();

      let blogList: BlogPost[] = [];
      if (Array.isArray(response)) blogList = response;
      else if (Array.isArray(response?.data)) blogList = response.data;
      else if (Array.isArray(response?.docs)) blogList = response.docs;

      setPublishedBlogs(blogList);
    } catch (err: unknown) {
      console.error("Failed to fetch published feed:", err);
      const msg = err instanceof Error ? err.message : "Failed to load live published feed.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && allowed) {
      fetchPublishedFeed();
    }
  }, [user, allowed, fetchPublishedFeed]);

  if (sessionLoading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Live Published Feed" subtitle="Verifying permissions..." />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Live Article Feed"
        subtitle="Explore all currently published articles live on the platform"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {errorMsg && (
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={fetchPublishedFeed}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            <div className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            <div className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          </div>
        ) : publishedBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Globe size={36} className="text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No live published articles found</h3>
            <p className="text-xs text-slate-400 mt-1">Check back later or submit new story drafts for review.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedBlogs.map((story) => {
              const authorName = story.author?.firstName
                ? `${story.author.firstName} ${story.author.lastName || ""}`.trim()
                : story.author?.username || "Contributor";

              return (
                <div
                  key={story._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:shadow-md hover:border-slate-300"
                >
                  {story.img ? (
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={story.img}
                        alt={story.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        <Tag size={10} /> {story.tag || "General"}
                      </span>
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-tr from-slate-100 to-indigo-50/50 p-4 flex items-center justify-center">
                      <Globe size={32} className="text-slate-300" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {story.title}
                      </h3>
                      {story.excerpt && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {story.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 truncate">
                        <UserIcon size={12} /> {authorName}
                      </span>
                      {story.publishedAt && (
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar size={12} /> {new Date(story.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}