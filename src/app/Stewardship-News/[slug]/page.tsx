'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { blogsApi } from '@/lib/api/blogs';
import { BlogPost, BlogBlock } from '@/types';
import Footer from '@/components/Footer';
import CustomShareModal from '@/components/CustomShareModal';
import ArticleCommentSection from '@/components/ArticleCommentSection';
import ArticleSidebar from '@/components/ArticleSidebar';
import { useSession } from '@/hooks/useSession';
import {
  Calendar,
  User as UserIcon,
  Globe,
  FileText,
  ArrowLeft,
  Share2,
  Link2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  MessageCircle,
} from 'lucide-react';

// 🟢 Cloudinary Image Auto-Optimizer (Reduces media payloads by 70–80%)
function getOptimizedImageUrl(url?: string, width = 1200): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || url.includes('/f_auto,q_auto/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}

// Same idempotent version used by the editor, so both sides always agree.
function formatPublishedLinks(text: string): string {
  if (!text) return '';

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  // Markdown links [label](url)
  let formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => {
      const cleanUrl = normalizeUrl(url);
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}" class="published-article-link">${label}</a>`;
    }
  );

  // Rich text editor data-href spans
  formatted = formatted.replace(
    /<span class="editor-link" data-href="([^"]+)">([^<]+)<\/span>/g,
    (_, url, label) => {
      const cleanUrl = normalizeUrl(url);
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}" class="published-article-link">${label}</a>`;
    }
  );

  // Standard HTML <a> tags (skip the ones that are already normalised)
  formatted = formatted.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, url, _restAttrs, label) => {
      if (match.includes('published-article-link')) return match;
      const cleanUrl = normalizeUrl(url);
      const cleanLabel = label.replace(/^🔗\s*/, '');
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}" class="published-article-link">${cleanLabel}</a>`;
    }
  );

  return formatted;
}

// True when the saved text already contains HTML from the editor (bold, underline, spans, links...)
const hasHtmlMarkup = (text: string): boolean => /<\/?[a-z][\s\S]*?>/i.test(text);

// Renders a text block from the editor.
// - HTML content is rendered as ONE <div> (never split on newlines, never wrapped in <p>),
//   so tags like <b>...</b> are not cut in half and <div style="text-align:..."> is valid.
// - Plain text keeps the old behaviour: one <p> per line.
function renderRichText(text: string, keyPrefix: string | number, pClassName: string) {
  const source = text || '';

  if (hasHtmlMarkup(source)) {
    return (
      <div
        key={keyPrefix}
        className={`art-rich ${pClassName}`}
        dangerouslySetInnerHTML={{ __html: formatPublishedLinks(source.trim()) }}
      />
    );
  }

  return source.split(/\n+/).map((paragraphText, pIdx) => (
    <p
      key={`${keyPrefix}-${pIdx}`}
      className={`art-rich ${pClassName}`}
      dangerouslySetInnerHTML={{ __html: formatPublishedLinks(paragraphText.trim()) }}
    />
  ));
}

const renderSocialPlatformIcon = (platformName: string) => {
  const p = platformName.toLowerCase();
  
  if (p.includes('x') || p.includes('twitter')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-slate-900 transition-transform group-hover:scale-110 group-hover:fill-[#C22055]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-[#0A66C2] transition-transform group-hover:scale-110 group-hover:fill-[#C22055]">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-[#1877F2] transition-transform group-hover:scale-110 group-hover:fill-[#C22055]">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-[#E4405F] transition-transform group-hover:scale-110 group-hover:fill-[#C22055]">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 2.156 4.919 5.406.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 5.255-4.919 5.404-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-2.199-4.919-5.404-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-5.255 4.919-5.406 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  return <MessageCircle size={28} className="text-[#C22055] transition-transform group-hover:scale-110" />;
};

export default function StewardshipArticlePage() {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  
  const { user } = useSession();

  const cacheKey = `biocap_art_${slug}`;

  // Session cache: used ONLY to paint instantly. Fresh data always replaces it.
  const [cachedStory] = useState<BlogPost | null>(() => {
    if (typeof window === 'undefined' || !slug) return null;
    try {
      const stored = sessionStorage.getItem(cacheKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { data: swrStory, error: swrError, isLoading: swrLoading, mutate: revalidateStory } = useSWR(
    slug ? `public-article-${slug}` : null,
    async () => {
      const fresh = await blogsApi.getPublicBlogBySlug(slug);
      if (fresh && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(fresh));
        } catch (e) {
          console.warn('Session cache quota exceeded', e);
        }
      }
      return fresh;
    },
    {
      fallbackData: cachedStory || undefined,
      // FIX: always fetch the latest published version on mount.
      // Before, revalidateIfStale:false + fallbackData meant it NEVER fetched,
      // so an old cached copy (without your bold/underline/links) kept showing.
      revalidateOnMount: true,
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // was 300000 (5 min)
    }
  );

  const story = swrStory || cachedStory;
  const loading = swrLoading && !story;

  // PARALLEL SIDEBAR DISPATCH
  const { data: rawMoreData } = useSWR(
    'related-stories-sidebar-global',
    () => blogsApi.getPublicBlogs({ page: 1, limit: 9 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const moreCollection = Array.isArray(rawMoreData)
    ? rawMoreData
    : Array.isArray((rawMoreData as any)?.data)
    ? (rawMoreData as any).data
    : Array.isArray((rawMoreData as any)?.docs)
    ? (rawMoreData as any).docs
    : [];

  const moreStories = moreCollection.filter((s: BlogPost) => s.slug !== slug).slice(0, 6);
  const error = swrError && !story ? (swrError instanceof Error ? swrError.message : 'Failed to load story') : null;

  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    phone: '',
    content: '',
  });
  const [replyCommentId, setReplyCommentId] = useState<string | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [consentSubmitting, setConsentSubmitting] = useState<'approve' | 'reject' | null>(null);
  const [consentNote, setConsentNote] = useState('');
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const creator = story?.originalAuthor || story?.author;
  const authorFullName = creator?.firstName
    ? `${creator.firstName} ${creator.lastName || ''}`.trim()
    : 'BioCap Contributor';
  const authorJobTitle = creator?.jobTitle?.trim() || '';
  const authorDisplayByline = authorJobTitle
    ? `${authorFullName} (${authorJobTitle})`
    : authorFullName;

  const publishedLabel = story?.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const storyMeta = story as (BlogPost & {
    eventLabel?: string;
    organizer?: string;
    keyPartners?: string[];
  }) | null;
  const eventLabel = storyMeta?.eventLabel;
  const organizer = storyMeta?.organizer;
  const keyPartners = storyMeta?.keyPartners;
  const isWriter = !!user && (story?.originalAuthor?._id === user._id || story?.author?._id === user._id);
  const canPublish = !story || story.publishConsentStatus === 'approved' || story.publishConsentStatus === 'not_required' || !story.publishConsentStatus;
  const writerConsentPending = story?.publishConsentStatus === 'pending' && isWriter;

  const visibleComments = (story?.comments || []).filter(
    (comment) => !comment.isDeleted && comment.isVisible !== false
  );

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!story) return;

    if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.content.trim()) {
      setCommentError('Name, email, and comment are required.');
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError(null);
      setCommentSuccess(null);

      await blogsApi.addPublicBlogComment(slug, {
        name: commentForm.name.trim(),
        email: commentForm.email.trim(),
        phone: commentForm.phone.trim() || undefined,
        content: commentForm.content.trim(),
        parentComment: replyCommentId || null,
      });

      setCommentForm({ 
        name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '', 
        email: user?.email || '', 
        phone: '', 
        content: '' 
      });
      setReplyCommentId(null);
      setCommentSuccess('Your comment has been posted successfully.');
      await revalidateStory();
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Unable to post your comment right now.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleConsentDecision = async (approved: boolean) => {
    if (!story) return;

    try {
      setConsentSubmitting(approved ? 'approve' : 'reject');
      await blogsApi.respondToWriterConsent(story._id, {
        approved,
        note: approved ? 'Approved by writer.' : (consentNote || 'The article needs revision before publication.'),
      });
      setConsentNote('');
      await revalidateStory();
    } catch (err: unknown) {
      console.error('Failed to update consent:', err);
      window.alert(err instanceof Error ? err.message : 'Unable to update the writer consent decision.');
    } finally {
      setConsentSubmitting(null);
    }
  };

  const isFilteredOrgLink =
    story?.organizationLink &&
    !story.organizationLink.includes('realgreengoldltd.com');

  const heroCoverUrl = getOptimizedImageUrl(story?.img, 1400);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .art-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .art-serif { font-family: 'DM Serif Display', Georgia, serif; }

        /* Formatting saved by the editor (bold, italic, underline, strike, sub, sup) */
        .art-rich b, .art-rich strong { font-weight: 700; }
        .art-rich i, .art-rich em { font-style: italic; }
        .art-rich u { text-decoration: underline; }
        .art-rich s, .art-rich strike, .art-rich del { text-decoration: line-through; }
        .art-rich sub { vertical-align: sub; font-size: 0.75em; }
        .art-rich sup { vertical-align: super; font-size: 0.75em; }
        .art-rich mark { background-color: #FEF08A; }

        .published-article-link, .published-article-link * {
          color: #0057FF !important;
          text-decoration: underline !important;
          text-decoration-color: #0057FF !important;
          text-underline-offset: 2px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: color 0.15s ease !important;
        }
        .published-article-link:hover {
          color: #003DB8 !important;
          text-decoration-color: #003DB8 !important;
        }
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
            <div className="rounded-2xl border border-[#C22055]/20 bg-[#C22055]/5 p-6 text-xs font-medium text-[#8B4136]">
              {error}
            </div>
          </div>
        ) : story ? (
          <>
            {/* HERO */}
            <section className="relative overflow-hidden min-h-[380px] flex items-end px-6 lg:px-12 pb-9">
              <div className="absolute inset-0 z-0">
                {heroCoverUrl ? (
                  <img src={heroCoverUrl} alt="" className="w-full h-full object-cover" />
                ) : null}
                <div
                  className="absolute inset-0"
                  style={{
                    background: heroCoverUrl
                      ? 'linear-gradient(90deg, rgba(27,58,92,0.94) 0%, rgba(27,58,92,0.88) 45%, rgba(27,58,92,0.55) 100%)'
                      : 'linear-gradient(135deg, #0f2240 0%, #254a7a 55%, #1e4976 100%)',
                  }}
                />
              </div>

              <div className="relative z-10 max-w-4xl py-8">
                <Link
                  href="/Stewardship-News"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#C22055] hover:text-white transition mb-4"
                >
                  <ArrowLeft size={13} /> Back to Stewardship News
                </Link>

                <div className="mb-4">
                  <span className="inline-block bg-[#C22055] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded">
                    {story.tag || 'General'}
                  </span>
                </div>

                <h1 className="art-serif italic text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5">
                  {story.title}
                </h1>

                <div className="w-16 h-px bg-white/25 mb-4" />

                <div className="flex items-center gap-5 flex-wrap text-xs text-white/80 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <UserIcon size={13} /> By {authorDisplayByline}
                  </span>
                  {publishedLabel && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} /> {publishedLabel}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* BODY + SIDEBAR */}
            <main className="mx-auto max-w-7xl px-6 lg:px-12 py-12 grid lg:grid-cols-[1fr_320px] gap-12 items-start">
              <article className="min-w-0 space-y-6">
                {story.blocks && story.blocks.length > 0 ? (
                  story.blocks.map((block: BlogBlock, idx: number) => {
                    if (block.type === 'h2') {
                      // FIX: h2 can contain editor HTML (bold, colour, links...), so render it as HTML
                      return (
                        <h2
                          key={idx}
                          className="art-rich text-xl sm:text-2xl font-bold text-[#1B3A5C] mt-8 mb-1"
                          dangerouslySetInnerHTML={{
                            __html: formatPublishedLinks(block.text || ''),
                          }}
                        />
                      );
                    }

                    if (block.type === 'quote') {
                      return (
                        <blockquote
                          key={idx}
                          className="border-l-[3px] pl-5 py-1 my-6 italic text-slate-700 text-base sm:text-lg leading-relaxed text-justify"
                          style={{ borderColor: '#C22055' }}
                        >
                          <span
                            className="art-rich"
                            dangerouslySetInnerHTML={{
                              __html: formatPublishedLinks(block.text || ''),
                            }}
                          />
                          {block.caption && (
                            <footer className="mt-2 not-italic text-[11px] font-bold uppercase tracking-widest text-[#C22055]">
                              — {block.caption}
                            </footer>
                          )}
                        </blockquote>
                      );
                    }

                    if (block.type === 'image' && (block.src || block.url)) {
                      const sectionImgUrl = getOptimizedImageUrl(block.src || block.url, 1200);
                      return (
                        <figure key={idx} className="my-8 space-y-2">
                          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 flex items-center justify-center max-h-[650px] w-full">
                            <img
                              src={sectionImgUrl}
                              alt={block.caption || `Story Section ${idx + 1}`}
                              className="w-full h-auto max-h-[650px] object-contain rounded-2xl"
                            />
                          </div>
                          {block.caption && (
                            <figcaption className="text-center text-xs font-medium text-slate-500 italic pt-1">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    // FIX: paragraphs with editor HTML render as ONE <div> (no newline split, no <p> wrapper)
                    return (
                      <React.Fragment key={idx}>
                        {renderRichText(
                          block.text || '',
                          idx,
                          'text-sm sm:text-base text-slate-700 leading-relaxed text-justify mb-4'
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <React.Fragment>
                    {renderRichText(
                      story.excerpt || '',
                      'excerpt',
                      'text-sm text-slate-600 text-justify mb-4'
                    )}
                  </React.Fragment>
                )}

                {/* STANDALONE SOCIAL ICONS */}
                {(() => {
                  const blogHandle = story.socialHandle?.trim();
                  const authorHandle = story.originalAuthor?.socialHandle?.trim() || story.author?.socialHandle?.trim();

                  const isDefaultHandle = !blogHandle || blogHandle.toLowerCase() === "@biocap" || blogHandle.toLowerCase() === "biocap";
                  const rawSocialHandle = isDefaultHandle && authorHandle ? authorHandle : (blogHandle || authorHandle || "");

                  if (!rawSocialHandle && !isFilteredOrgLink && !story.document && !story.documentUrl) {
                    return null;
                  }

                  return (
                    <div className="mt-8 pt-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#C22055]" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#1B3A5C]">
                          Reach out to author's handle
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-5">
                        {rawSocialHandle.length > 0 &&
                          rawSocialHandle.split(' | ').map((handleEntry: string, idx: number) => {
                            const parts = handleEntry.split(': ');
                            const platform = parts.length > 1 ? parts[0] : 'Social';
                            const handleValue = parts.length > 1 ? parts.slice(1).join(': ') : handleEntry;

                            let targetUrl = handleValue;
                            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                              if (platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x')) {
                                targetUrl = `https://x.com/${handleValue.replace('@', '')}`;
                              } else if (platform.toLowerCase().includes('linkedin')) {
                                targetUrl = `https://linkedin.com/in/${handleValue}`;
                              } else if (platform.toLowerCase().includes('facebook')) {
                                targetUrl = `https://facebook.com/${handleValue}`;
                              } else if (platform.toLowerCase().includes('instagram')) {
                                targetUrl = `https://instagram.com/${handleValue.replace('@', '')}`;
                              } else {
                                targetUrl = `https://${handleValue}`;
                              }
                            }

                            return (
                              <a
                                key={idx}
                                href={targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                title={`${platform}: ${handleValue}`}
                                className="group relative inline-flex items-center justify-center cursor-pointer"
                              >
                                {renderSocialPlatformIcon(platform)}
                              </a>
                            );
                          })}

                        {isFilteredOrgLink && (
                          <a
                            href={story.organizationLink}
                            target="_blank"
                            rel="noreferrer"
                            title={`Organization: ${story.organizationLink}`}
                            className="inline-flex items-center justify-center text-[#1B3A5C] hover:text-[#C22055] transition-transform hover:scale-110"
                          >
                            <Globe size={28} />
                          </a>
                        )}

                        {(story.document || story.documentUrl) && (
                          <a
                            href={story.documentUrl || story.document}
                            target="_blank"
                            rel="noreferrer"
                            title={story.documentName || 'Download Document PDF'}
                            className="inline-flex items-center justify-center text-[#2F8F5B] hover:text-[#C22055] transition-transform hover:scale-110"
                          >
                            <FileText size={28} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {writerConsentPending && (
                  <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-slate-700">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 text-amber-700" size={18} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1B3A5C]">Writer review required</p>
                        <p className="mt-2 text-sm leading-7">
                          The editor made changes to this article. Please review and approve or reject the modifications before publishing.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={!!consentSubmitting}
                            onClick={() => handleConsentDecision(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#1B3A5C] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60 cursor-pointer"
                          >
                            {consentSubmitting === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Approve changes
                          </button>
                          <button
                            type="button"
                            disabled={!!consentSubmitting}
                            onClick={() => handleConsentDecision(false)}
                            className="inline-flex items-center gap-2 rounded-full border border-[#1B3A5C]/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1B3A5C] disabled:opacity-60 cursor-pointer"
                          >
                            {consentSubmitting === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                            Reject changes
                          </button>
                        </div>
                        <textarea
                          value={consentNote}
                          onChange={(event) => setConsentNote(event.target.value)}
                          placeholder="Optional note for rejection or approval"
                          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-[#1B3A5C]"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!canPublish && story?.publishConsentStatus && story.publishConsentStatus !== 'approved' && story.publishConsentStatus !== 'not_required' && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                    Publishing is currently blocked until the writer resolves the pending consent decision.
                  </div>
                )}

                {/* Comments Component */}
                <ArticleCommentSection
                  comments={visibleComments}
                  commentForm={commentForm}
                  setCommentForm={setCommentForm}
                  replyCommentId={replyCommentId}
                  setReplyCommentId={setReplyCommentId}
                  commentSubmitting={commentSubmitting}
                  commentError={commentError}
                  commentSuccess={commentSuccess}
                  handleCommentSubmit={handleCommentSubmit}
                />

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
                      onClick={() => setIsShareModalOpen(true)}
                      aria-label="Share this article"
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#C22055] hover:text-[#C22055] transition cursor-pointer"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard?.writeText(window.location.href);
                          window.alert('Link copied to clipboard!');
                        }
                      }}
                      aria-label="Copy link"
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#C22055] hover:text-[#C22055] transition cursor-pointer"
                    >
                      <Link2 size={13} />
                    </button>
                  </div>
                </div>
              </article>

              {/* Sidebar Component */}
              <ArticleSidebar
                story={story}
                eventLabel={eventLabel}
                publishedLabel={publishedLabel}
                organizer={organizer}
                authorDisplayByline={authorDisplayByline}
                keyPartners={keyPartners}
                moreStories={moreStories}
                onOpenShareModal={() => setIsShareModalOpen(true)}
              />
            </main>
          </>
        ) : (
          <div className="text-center py-24 text-sm text-slate-500">
            Requested story could not be found.
          </div>
        )}
      </div>

      {/* Share Article Modal Component */}
      {story && (
        <CustomShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={story.title}
          img={story.img}
          url={typeof window !== 'undefined' ? window.location.href : ''}
        />
      )}

      <Footer />
    </div>
  );
}