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
  MessageCircle,
  X,
  Check,
  Copy,
} from 'lucide-react';
import Link from 'next/link';

// ── Visual system for Stewardship News hub ──────

const TAG_ACCENTS = ['#2A7F8C', '#7B3FA0', '#C22055', '#2F8F5B', '#D97706', '#1B3A5C', '#0891B2', '#B45309'];
const accentForTag = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TAG_ACCENTS[hash % TAG_ACCENTS.length];
};

/**
 * Helper to render standalone platform vector icons
 */
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

/**
 * Custom Share Modal Component (Inbox Direct Share + Preview)
 */
function CustomShareModal({
  isOpen,
  onClose,
  title,
  img,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  img?: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      bg: 'bg-[#25D366] hover:bg-[#20ba5a]',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-[#229ED9] hover:bg-[#1d8cb0]',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.5 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bg: 'bg-slate-900 hover:bg-slate-800',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-[#0A66C2] hover:bg-[#0855a0]',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2] hover:bg-[#1464cf]',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5">
        
        {/* Modal Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1B3A5C]">
            <Share2 size={18} className="text-[#C22055]" />
            <h3 className="text-base font-bold">Share Article</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Story Preview Card */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-[#F9F8F6] p-3">
          {img ? (
            <img
              src={img}
              alt={title}
              className="h-16 w-16 rounded-lg object-cover shrink-0 border border-slate-200"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-[#1B3A5C]/10 flex items-center justify-center shrink-0">
              <Share2 size={20} className="text-[#1B3A5C]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1B3A5C] line-clamp-2 leading-snug">
              {title}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 truncate">{url}</p>
          </div>
        </div>

        {/* Social Share Buttons Grid */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Share directly to chat / inbox
          </p>
          <div className="grid grid-cols-5 gap-2">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${link.bg} transition-transform group-hover:scale-105 shadow-xs`}>
                  {link.icon}
                </div>
                <span className="text-[9px] font-semibold text-slate-600 truncate max-w-full">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Copyable Link */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-3">
            <Link2 size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 bg-transparent text-xs text-slate-600 outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B3A5C] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#254a7a] cursor-pointer shrink-0"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StewardshipArticlePage() {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  
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
  
  // Custom Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const getCommentAuthorName = (comment: Comment) => {
    if (comment.user && comment.user.firstName) {
      return `${comment.user.firstName} ${comment.user.lastName || ''}`.trim();
    }
    return comment.name || 'Guest';
  };

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
                <span className="rounded-full bg-[#C22055]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C22055]">
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
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#1B3A5C] hover:text-[#C22055] cursor-pointer"
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
            <div className="rounded-2xl border border-[#C22055]/20 bg-[#C22055]/5 p-6 text-xs font-medium text-[#8B4136]">
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
                          style={{ borderColor: '#C22055' }}
                        >
                          {block.text}
                          {block.caption && (
                            <footer className="mt-2 not-italic text-[11px] font-bold uppercase tracking-widest text-[#C22055]">
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

                {/* ── STANDALONE SOCIAL ICONS ── */}
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
                      
                      {/* Title Header */}
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#C22055]" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#1B3A5C]">
                          Reach out to author's handle
                        </h4>
                      </div>

                      {/* Icon Row */}
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

                        {/* Organization Link & Document Attachments */}
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
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#C22055]/20 bg-[#C22055]/5 px-3 py-2 text-xs text-[#8B4136]">
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
                      className="inline-flex items-center gap-2 rounded-full bg-[#C22055] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-70 cursor-pointer"
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

              {/* SIDEBAR */}
              <aside className="space-y-5 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-[#e2e8f3] bg-white p-5 shadow-sm">
                  <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#1B3A5C] mb-4">
                    <Newspaper size={13} className="text-[#C22055]" /> {eventLabel ? 'Event Details' : 'Story Details'}
                  </p>
                  <div className="space-y-3 text-xs text-slate-600">
                    {eventLabel ? (
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-[#C22055] shrink-0" />
                        <span className="font-semibold text-[#1B3A5C]">{eventLabel}</span>
                      </div>
                    ) : (
                      publishedLabel && (
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-[#C22055] shrink-0" />
                          <span>{publishedLabel}</span>
                        </div>
                      )
                    )}
                    <div className="flex items-center gap-2">
                      <UserIcon size={13} className="text-[#C22055] shrink-0" />
                      <span>{organizer || authorDisplayByline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-[#C22055] shrink-0" />
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
                    onClick={() => setIsShareModalOpen(true)}
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
                              <p className="text-[13px] font-semibold text-[#1B3A5C] leading-snug line-clamp-2 group-hover:text-[#C22055] transition-colors">
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

      {/* Share Article Modal */}
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