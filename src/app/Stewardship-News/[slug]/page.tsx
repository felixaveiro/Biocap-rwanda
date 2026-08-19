'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { blogsApi } from '@/lib/api/blogs';
import { BlogPost, BlogBlock } from '@/types';
import Footer from '@/components/Footer';
import {
  Tag,
  Calendar,
  User as UserIcon,
  AtSign,
  Globe,
  FileText,
  ArrowLeft,
  Share2,
  Link2,
  Newspaper,
} from 'lucide-react';
import Link from 'next/link';

// ── Same visual system as the Stewardship News hub: DM Serif Display for
// headlines, Plus Jakarta Sans for body, navy #1B3A5C + magenta #E8185A accent.

const TAG_ACCENTS = ['#2A7F8C', '#7B3FA0', '#E8185A', '#2F8F5B', '#D97706', '#1B3A5C', '#0891B2', '#B45309'];
const accentForTag = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TAG_ACCENTS[hash % TAG_ACCENTS.length];
};

export default function StewardshipArticlePage() {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  const [story, setStory] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreStories, setMoreStories] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!slug) return;
    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await blogsApi.getPublicBlogBySlug(slug);
        setStory(res);
      } catch (err: unknown) {
        console.error('Failed to load story:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  useEffect(() => {
    const fetchMore = async () => {
      try {
        const res: any = await blogsApi.getPublicBlogs({ page: 1, limit: 9 });
        let items: BlogPost[] = [];
        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res?.data)) items = res.data;
        else if (Array.isArray(res?.docs)) items = res.docs;
        setMoreStories(items.filter((s) => s.slug !== slug).slice(0, 6));
      } catch (err) {
        console.error('Failed to load related stories:', err);
      }
    };
    fetchMore();
  }, [slug]);

  const authorName = story?.originalAuthor?.firstName
    ? `${story.originalAuthor.firstName} ${story.originalAuthor.lastName || ''}`.trim()
    : story?.author?.firstName
    ? `${story.author.firstName} ${story.author.lastName || ''}`.trim()
    : 'BioCap Contributor';

  const publishedLabel = story?.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const eventLabel = (story as any)?.eventLabel as string | undefined;
  const organizer = (story as any)?.organizer as string | undefined;
  const keyPartners = (story as any)?.keyPartners as string[] | undefined;

  // Filter out realgreengoldltd link if present
  const isFilteredOrgLink =
    story?.organizationLink &&
    !story.organizationLink.includes('realgreengoldltd.com');

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .art-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .art-serif { font-family: 'DM Serif Display', Georgia, serif; }
      `}</style>

      <div className="art-page">
        {loading ? (
          <div className="mx-auto max-w-4xl px-6 py-16 space-y-6 animate-pulse">
            <div className="h-8 w-3/4 rounded-xl bg-slate-100" />
            <div className="h-72 w-full rounded-2xl bg-slate-100" />
            <div className="h-24 w-full rounded-xl bg-slate-100" />
          </div>
        ) : error ? (
          <div className="mx-auto max-w-4xl px-6 py-16">
            <div className="rounded-2xl border border-[#E8185A]/20 bg-[#E8185A]/5 p-6 text-xs font-medium text-[#8B4136]">
              {error}
            </div>
          </div>
        ) : story ? (
          <>
            {/* ── HERO ── */}
            <section className="relative overflow-hidden min-h-[380px] flex items-end px-6 lg:px-12 pb-9">
              <div className="absolute inset-0 z-0">
                {story.img ? (
                  <img src={story.img} alt="" className="w-full h-full object-cover" />
                ) : null}
                <div
                  className="absolute inset-0"
                  style={{
                    background: story.img
                      ? 'linear-gradient(90deg, rgba(27,58,92,0.94) 0%, rgba(27,58,92,0.88) 45%, rgba(27,58,92,0.55) 100%)'
                      : 'linear-gradient(135deg, #0f2240 0%, #254a7a 55%, #1e4976 100%)',
                  }}
                />
              </div>

              <div className="relative z-10 max-w-4xl py-8">
                <Link
                  href="/Stewardship-News"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#E8185A] hover:text-white transition mb-4"
                >
                  <ArrowLeft size={13} /> Back to Stewardship News
                </Link>

                <div className="mb-4">
                  <span className="inline-block bg-[#E8185A] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded">
                    {story.tag || 'General'}
                  </span>
                </div>

                <h1 className="art-serif italic text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5">
                  {story.title}
                </h1>

                <div className="w-16 h-px bg-white/25 mb-4" />

                <div className="flex items-center gap-5 flex-wrap text-xs text-white/80 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <UserIcon size={13} /> By {authorName}
                  </span>
                  {publishedLabel && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} /> {publishedLabel}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* ── BODY + SIDEBAR ── */}
            <main className="mx-auto max-w-7xl px-6 lg:px-12 py-12 grid lg:grid-cols-[1fr_320px] gap-12 items-start">
              <article className="min-w-0 space-y-6">
                {/* Body sections */}
                {story.blocks && story.blocks.length > 0 ? (
                  story.blocks.map((block: BlogBlock, idx: number) => {
                    if (block.type === 'h2') {
                      return (
                        <h2 key={idx} className="text-xl sm:text-2xl font-bold text-[#1B3A5C] mt-8 mb-1">
                          {block.text}
                        </h2>
                      );
                    }

                    if (block.type === 'quote') {
                      return (
                        <blockquote
                          key={idx}
                          className="border-l-[3px] pl-5 py-1 my-6 italic text-slate-700 text-base sm:text-lg leading-relaxed text-justify"
                          style={{ borderColor: '#E8185A' }}
                        >
                          {block.text}
                          {block.caption && (
                            <footer className="mt-2 not-italic text-[11px] font-bold uppercase tracking-widest text-[#E8185A]">
                              — {block.caption}
                            </footer>
                          )}
                        </blockquote>
                      );
                    }

                    if (block.type === 'image' && (block.src || block.url)) {
                      return (
                        <figure key={idx} className="my-7 space-y-2">
                          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900 max-h-96">
                            <img
                              src={block.src || block.url}
                              alt={block.caption || `Story Section ${idx + 1}`}
                              className={`w-full max-h-96 ${
                                block.fitMode === 'contain' ? 'object-contain bg-slate-950' : 'object-cover'
                              }`}
                            />
                          </div>
                          {block.caption && (
                            <figcaption className="text-center text-xs font-medium text-slate-500 italic">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    // Splits text on Enter (\n) into individual paragraph tags
                    return (
                      <React.Fragment key={idx}>
                        {(block.text || '')
                          .split(/\n+/)
                          .map((paragraphText, pIdx) => (
                            <p
                              key={pIdx}
                              className="text-sm sm:text-base text-slate-700 leading-relaxed text-justify mb-4"
                            >
                              {paragraphText.trim()}
                            </p>
                          ))}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <React.Fragment>
                    {(story.excerpt || '')
                      .split(/\n+/)
                      .map((paragraphText, pIdx) => (
                        <p key={pIdx} className="text-sm text-slate-600 text-justify mb-4">
                          {paragraphText.trim()}
                        </p>
                      ))}
                  </React.Fragment>
                )}

                {/* Compact bottom card for author credentials & attachments */}
                {(story.socialHandle || isFilteredOrgLink || story.document || story.documentUrl) && (
                  <div className="mt-8 pt-4">
                    <div className="inline-flex flex-wrap items-center gap-3 rounded-lg bg-[#f7f6f4] border border-slate-200/80 px-4 py-2.5 text-xs text-slate-600 max-w-fit shadow-2xs">
                      {story.socialHandle && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                          <AtSign size={13} className="text-[#E8185A]" /> {story.socialHandle}
                        </span>
                      )}
                      {isFilteredOrgLink && (
                        <a
                          href={story.organizationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-[#1B3A5C] hover:underline"
                        >
                          <Globe size={13} /> {story.organizationLink}
                        </a>
                      )}
                      {(story.document || story.documentUrl) && (
                        <a
                          href={story.documentUrl || story.document}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-[#2F8F5B] hover:underline"
                        >
                          <FileText size={13} /> {story.documentName || 'Attached Document PDF'}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom navigation + share */}
                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <Link
                    href="/Stewardship-News"
                    className="inline-flex items-center gap-2 rounded-full border border-[#1B3A5C]/25 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white transition"
                  >
                    <ArrowLeft size={13} /> Back to Stewardship News
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigator.share?.({ title: story.title, url: window.location.href })}
                      aria-label="Share this article"
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#E8185A] hover:text-[#E8185A] transition"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      aria-label="Copy link"
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#E8185A] hover:text-[#E8185A] transition"
                    >
                      <Link2 size={13} />
                    </button>
                  </div>
                </div>
              </article>

              {/* ── SIDEBAR ── */}
              <aside className="space-y-5 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-[#e2e8f3] bg-white p-5 shadow-sm">
                  <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#1B3A5C] mb-4">
                    <Newspaper size={13} className="text-[#E8185A]" /> {eventLabel ? 'Event Details' : 'Story Details'}
                  </p>
                  <div className="space-y-3 text-xs text-slate-600">
                    {eventLabel ? (
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-[#E8185A] shrink-0" />
                        <span className="font-semibold text-[#1B3A5C]">{eventLabel}</span>
                      </div>
                    ) : (
                      publishedLabel && (
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-[#E8185A] shrink-0" />
                          <span>{publishedLabel}</span>
                        </div>
                      )
                    )}
                    <div className="flex items-center gap-2">
                      <UserIcon size={13} className="text-[#E8185A] shrink-0" />
                      <span>{organizer || authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-[#E8185A] shrink-0" />
                      <span>{story.tag || 'General'}</span>
                    </div>
                  </div>

                  {keyPartners && keyPartners.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#8B9188] mb-2">
                        Key Partners
                      </p>
                      <p className="text-xs font-medium text-[#1B3A5C] leading-relaxed text-justify">
                        {keyPartners.join(' \u00B7 ')}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigator.share?.({ title: story.title, url: window.location.href })}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#1B3A5C]/20 py-2 text-[11px] font-bold uppercase tracking-widest text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white transition"
                  >
                    <Share2 size={13} /> Share Article
                  </button>
                </div>

                {moreStories.length > 0 && (
                  <div className="rounded-2xl border border-[#e2e8f3] bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#1B3A5C] mb-4">
                      More Stories
                    </p>
                    <div className="space-y-4">
                      {moreStories.map((s) => {
                        const accent = accentForTag(s.tag || s.title);
                        return (
                          <Link
                            key={s._id}
                            href={`/Stewardship-News/${s.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                              {s.img ? (
                                <img src={s.img} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full" style={{ background: `${accent}22` }} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-[10px] font-black uppercase tracking-wide mb-0.5"
                                style={{ color: accent }}
                              >
                                {s.tag || 'General'}
                              </p>
                              <p className="text-[13px] font-semibold text-[#1B3A5C] leading-snug line-clamp-2 group-hover:text-[#E8185A] transition-colors">
                                {s.title}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </aside>
            </main>
          </>
        ) : (
          <div className="text-center py-24 text-sm text-slate-500">
            Requested story could not be found.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}