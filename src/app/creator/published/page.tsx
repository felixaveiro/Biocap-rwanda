'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { BlogPost } from "@/types";
import { Globe, RefreshCw, AlertCircle, Calendar, User as UserIcon, ExternalLink } from "lucide-react";

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
      const response = await blogsApi.getCreatorPublishedFeed();

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

  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };

  if (sessionLoading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] pb-16 font-sans">
        <Header title="Live Published Feed" subtitle="Verifying permissions..." />
        <div className="mx-auto max-w-7xl px-8 py-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-80 bg-[#EFECE6] border border-[#E2DDCF] animate-pulse" />
            <div className="h-80 bg-[#EFECE6] border border-[#E2DDCF] animate-pulse" />
            <div className="h-80 bg-[#EFECE6] border border-[#E2DDCF] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]">
      <Header
        title="Live Article Showcase"
        subtitle="Explore all currently published articles live on the public platform"
      />

      <main className="mx-auto max-w-7xl px-8 py-8 space-y-6">
        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-center justify-between border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={16} />
              <p className="text-xs font-medium">{errorMsg}</p>
            </div>
            <button
              onClick={fetchPublishedFeed}
              className="inline-flex items-center gap-1.5 border border-[#8B4136]/30 bg-[#FAF9F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5]"
              style={monoFont}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Catalog Feed Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-80 border border-[#E2DDCF] bg-[#EFECE6] animate-pulse" />
            <div className="h-80 border border-[#E2DDCF] bg-[#EFECE6] animate-pulse" />
            <div className="h-80 border border-[#E2DDCF] bg-[#EFECE6] animate-pulse" />
          </div>
        ) : publishedBlogs.length === 0 ? (
          <div className="border border-dashed border-[#D9D4C6] bg-[#FAF9F5] p-16 text-center text-[#7A8079]">
            <Globe size={32} className="mx-auto mb-3 text-[#A9812F]/60" />
            <h3 className="font-serif italic text-lg text-[#1E2620]" style={displayFont}>
              No live published articles recorded
            </h3>
            <p className="text-xs text-[#7A8079] mt-1 max-w-sm mx-auto">
              Check back later or submit new story manuscripts to the editorial desk for review.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedBlogs.map((story) => {
              const authorName = story.author?.firstName
                ? `${story.author.firstName} ${story.author.lastName || ""}`.trim()
                : story.author?.username || "Contributor";

              return (
                <article
                  key={story._id}
                  className="group flex flex-col border border-[#E2DDCF] bg-[#FAF9F5] transition-colors hover:border-[#1E2620]"
                >
                  {/* Article Plate */}
                  {story.img ? (
                    <div className="relative h-48 overflow-hidden border-b border-[#E2DDCF] bg-[#1E2620]">
                      <img
                        src={story.img}
                        alt={story.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                      />
                      <span
                        className="absolute top-3 left-3 border border-[#A9812F]/40 bg-[#1E2620]/90 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#A9812F] backdrop-blur-xs"
                        style={monoFont}
                      >
                        {story.tag || "General"}
                      </span>
                    </div>
                  ) : (
                    <div className="h-48 border-b border-[#E2DDCF] bg-[#EFECE6]/60 p-6 flex flex-col justify-between">
                      <span
                        className="self-start border border-[#A9812F]/40 bg-[#A9812F]/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#A9812F]"
                        style={monoFont}
                      >
                        {story.tag || "General"}
                      </span>
                      <Globe size={28} className="text-[#A9812F]/40" />
                    </div>
                  )}

                  {/* Article Metadata & Body */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div className="space-y-2.5">
                      <h3
                        className="font-serif italic text-lg leading-snug text-[#1E2620] group-hover:text-[#3F6B4F] transition-colors line-clamp-2"
                        style={displayFont}
                      >
                        {story.title}
                      </h3>
                      {story.excerpt && (
                        <p className="text-xs text-[#5A6259] leading-relaxed line-clamp-3 text-justify">
                          {story.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 border-t border-[#E2DDCF] pt-4">
                      <div
                        className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[#7A8079]"
                        style={monoFont}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <UserIcon size={12} className="text-[#A9812F]" /> {authorName}
                        </span>
                        {story.publishedAt && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar size={12} className="text-[#3F6B4F]" />
                            {new Date(story.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {story.slug && (
                        <Link
                          href={`/Stewardship-News/${story.slug}`}
                          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 border border-[#D9D4C6] bg-[#FAF9F5] py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1E2620] transition-colors hover:border-[#1E2620] hover:bg-[#1E2620] hover:text-[#FAF9F5]"
                          style={monoFont}
                        >
                          Read Article <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}