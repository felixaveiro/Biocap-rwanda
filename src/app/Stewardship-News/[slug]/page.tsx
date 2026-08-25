'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { blogsApi } from '@/lib/api/blogs';
import { BlogPost, BlogBlock, Comment } from '@/types';
import Footer from '@/components/Footer';
import { useSession } from '@/hooks/useSession';
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
  MessageSquare,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Reply,
  Send,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

// ── Visual system for Stewardship News hub ──────

const TAG_ACCENTS = ['#2A7F8C', '#7B3FA0', '#E8185A', '#2F8F5B', '#D97706', '#1B3A5C', '#0891B2', '#B45309'];
const accentForTag = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TAG_ACCENTS[hash % TAG_ACCENTS.length];
};

export default function StewardshipArticlePage() {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  
  // Pass NO required permission string to useSession so public guests avoid /auth/login redirects
  const { user } = useSession();

  const [story, setStory] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreStories, setMoreStories] = useState<BlogPost[]>([]);
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

  const fetchStory = useCallback(async () => {
    if (!slug) return;
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
  }, [slug]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await blogsApi.getPublicBlogBySlug(slug);
        if (active) setStory(res);
      } catch (err: unknown) {
        if (active) {
          console.error('Failed to load story:', err);
          setError(err instanceof Error ? err.message : 'Failed to load story');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const fetchMore = async () => {
      try {
        const res = await blogsApi.getPublicBlogs({ page: 1, limit: 9 });
        const collection = Array.isArray(res)
          ? res
          : Array.isArray((res as { data?: BlogPost[] })?.data)
            ? (res as { data: BlogPost[] }).data
            : Array.isArray((res as { docs?: BlogPost[] })?.docs)
              ? (res as { docs: BlogPost[] }).docs
              : [];
        setMoreStories(collection.filter((s) => s.slug !== slug).slice(0, 6));
      } catch (err) {
        console.error('Failed to load related stories:', err);
      }
    };
    void fetchMore();
  }, [slug]);

  const authorName = story?.originalAuthor?.firstName
    ? `${story.originalAuthor.firstName} ${story.originalAuthor.lastName || ''}`.trim()
    : story?.author?.firstName
    ? `${story.author.firstName} ${story.author.lastName || ''}`.trim()
    : 'BioCap Contributor';

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

  const getCommentAuthorName = (comment: Comment) => {
    if (comment.user && comment.user.firstName) {
      return `${comment.user.firstName} ${comment.user.lastName || ''}`.trim();
    }
    return comment.name || 'Guest';
  };

  // Public view only displays visible, non-deleted comments
  const visibleComments = (story?.comments || []).filter(
    (comment) => !comment.isDeleted && comment.isVisible !== false
  );
  const replyTargetComment = visibleComments.find((comment) => comment._id === replyCommentId) || null;

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
      await fetchStory();
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
      await fetchStory();
    } catch (err: unknown) {
      console.error('Failed to update consent:', err);
      window.alert(err instanceof Error ? err.message : 'Unable to update the writer consent decision.');
    } finally {
      setConsentSubmitting(null);
    }
  };

  const renderCommentTree = (comment: Comment, depth = 0) => {
    if (comment.isDeleted || comment.isVisible === false) return null;

    const authorName = getCommentAuthorName(comment);
    const replyCount = (comment.replies || []).filter(
      (reply) => !reply.isDeleted && reply.isVisible !== false
    ).length;

    return (
      <div 
        key={comment._id} 
        className="rounded-2xl border border-slate-200 bg-white p-4" 
        style={{ marginLeft: depth > 0 ? 24 : 0 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[#1B3A5C]">{authorName}</p>
              {comment.role && comment.role !== 'guest' && (
                <span className="rounded-full bg-[#E8185A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8185A]">
                  {String(comment.role).replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
              {new Date(comment.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-700">
          {comment.content}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setReplyCommentId(comment._id)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#1B3A5C] hover:text-[#E8185A] cursor-pointer"
          >
            <Reply size={12} /> Reply
          </button>
          {replyCount > 0 && (
            <span className="text-[10px] uppercase tracking-wide text-slate-400">
              {replyCount} reply{replyCount > 1 ? 'ies' : 'y'}
            </span>
          )}
        </div>

        {(comment.replies || []).filter((reply) => !reply.isDeleted && reply.isVisible !== false).length > 0 && (
          <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
            {(comment.replies || [])
              .filter((reply) => !reply.isDeleted && reply.isVisible !== false)
              .map((reply) => renderCommentTree(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
            {/* HERO */}
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

            {/* BODY + SIDEBAR */}
            <main className="mx-auto max-w-7xl px-6 lg:px-12 py-12 grid lg:grid-cols-[1fr_320px] gap-12 items-start">
              <article className="min-w-0 space-y-6">
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

                {/* Author Credentials & Platform-Specific Social Handles */}
                {(() => {
                  const blogHandle = story.socialHandle?.trim();
                  const authorHandle = story.originalAuthor?.socialHandle?.trim() || story.author?.socialHandle?.trim();

                  // Ignore legacy defaults like "@BioCap" and prioritize author profile platforms
                  const isDefaultHandle = !blogHandle || blogHandle.toLowerCase() === "@biocap" || blogHandle.toLowerCase() === "biocap";
                  const rawSocialHandle = isDefaultHandle && authorHandle ? authorHandle : (blogHandle || authorHandle || "");

                  if (!rawSocialHandle && !isFilteredOrgLink && !story.document && !story.documentUrl) {
                    return null;
                  }

                  return (
                    <div className="mt-8 pt-4">
                      <div className="inline-flex flex-wrap items-center gap-3 rounded-lg bg-[#f7f6f4] border border-slate-200/80 px-4 py-2.5 text-xs text-slate-600 max-w-fit shadow-2xs">
                        
                        {/* Dynamic Social Handles parsed from Author Profile or Story */}
                        {rawSocialHandle.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {rawSocialHandle.split(' | ').map((handleEntry: string, idx: number) => {
                              const parts = handleEntry.split(': ');
                              const platform = parts.length > 1 ? parts[0] : null;
                              const handleValue = parts.length > 1 ? parts.slice(1).join(': ') : handleEntry;
                              const isUrl = handleValue.startsWith('http://') || handleValue.startsWith('https://');

                              return (
                                <span key={idx} className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1 rounded-md shadow-2xs">
                                  <AtSign size={13} className="text-[#E8185A]" />
                                  {platform && <span className="font-bold text-[#1B3A5C]">{platform}:</span>}
                                  {isUrl ? (
                                    <a
                                      href={handleValue}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#E8185A] hover:underline max-w-[200px] sm:max-w-[300px] truncate"
                                      title={handleValue}
                                    >
                                      {handleValue.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                  ) : (
                                    <span>{handleValue}</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Organization Link */}
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

                        {/* Attached Document */}
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

                {/* Comments Section */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[#1B3A5C]">
                      <MessageSquare size={16} />
                      <h3 className="text-lg font-semibold">Comments</h3>
                    </div>
                    <span className="rounded-full bg-[#1B3A5C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      {visibleComments.length}
                    </span>
                  </div>

                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    {replyTargetComment && (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8185A]/20 bg-[#E8185A]/5 px-3 py-2 text-xs text-[#8B4136]">
                        <span>Replying to {getCommentAuthorName(replyTargetComment)}</span>
                        <button type="button" onClick={() => setReplyCommentId(null)} className="font-bold uppercase tracking-wide cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        value={commentForm.name}
                        onChange={(event) => setCommentForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Your name"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1B3A5C]"
                        required
                      />
                      <input
                        type="email"
                        value={commentForm.email}
                        onChange={(event) => setCommentForm((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="Your email"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1B3A5C]"
                        required
                      />
                    </div>

                    <input
                      type="tel"
                      value={commentForm.phone}
                      onChange={(event) => setCommentForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="Phone (optional)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1B3A5C]"
                    />

                    <textarea
                      value={commentForm.content}
                      onChange={(event) => setCommentForm((prev) => ({ ...prev, content: event.target.value }))}
                      placeholder={replyTargetComment ? `Write a reply to ${getCommentAuthorName(replyTargetComment)}` : 'Share your thoughts about this article'}
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1B3A5C]"
                      required
                    />

                    {commentError && <p className="text-sm text-rose-600">{commentError}</p>}
                    {commentSuccess && <p className="text-sm text-emerald-600">{commentSuccess}</p>}

                    <button
                      type="submit"
                      disabled={commentSubmitting}
                      className="inline-flex items-center gap-2 rounded-full bg-[#E8185A] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-70 cursor-pointer"
                    >
                      {commentSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      {commentSubmitting ? 'Posting...' : replyTargetComment ? 'Post reply' : 'Post comment'}
                    </button>
                  </form>

                  <div className="mt-6 space-y-4">
                    {visibleComments.length > 0 ? (
                      visibleComments.filter((comment) => !comment.parentComment).map((comment) => renderCommentTree(comment))
                    ) : (
                      <p className="text-sm text-slate-500">No public comments yet. Be the first to share your thoughts.</p>
                    )}
                  </div>
                </div>

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
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#E8185A] hover:text-[#E8185A] transition cursor-pointer"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(window.location.href)}
                      aria-label="Copy link"
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#E8185A] hover:text-[#E8185A] transition cursor-pointer"
                    >
                      <Link2 size={13} />
                    </button>
                  </div>
                </div>
              </article>

              {/* SIDEBAR */}
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
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#1B3A5C]/20 py-2 text-[11px] font-bold uppercase tracking-widest text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white transition cursor-pointer"
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