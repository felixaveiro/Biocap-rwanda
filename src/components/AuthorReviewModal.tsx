'use client';

import React, { useState, useEffect } from 'react';
import { sanitizeHtml } from "@/lib/sanitize";
import { createPortal } from 'react-dom';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { BlogPost, BlogBlock } from '@/types';
import { blogsApi } from '@/lib/api/blogs';
import {
  X,
  Send,
  Loader2,
  Calendar,
  User,
  Tag,
  Globe,
  ArrowLeft,
  Eye,
  FileText,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
});

interface AuthorReviewModalProps {
  story: BlogPost;
  onClose: () => void;
  onSubmitForReview: () => Promise<void> | void;
}

function formatMarkdownLinks(text: string): string {
  if (!text) return "";

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  let formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) =>
      `<a href="${normalizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="editor-link">${label}</a>`
  );

  formatted = formatted.replace(
    /<span class="editor-link" data-href="([^"]+)">([^<]+)<\/span>/g,
    (_, url, label) =>
      `<a href="${normalizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="editor-link">${label}</a>`
  );

  formatted = formatted.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (_, url, restAttrs, label) =>
      `<a href="${normalizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="editor-link"${restAttrs}>${label}</a>`
  );

  return sanitizeHtml(formatted);
}

const renderSocialPlatformIcon = (platformName: string) => {
  const p = platformName.toLowerCase();

  if (p.includes('x') || p.includes('twitter')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#1E2620] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#0A66C2] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#1877F2] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#E4405F] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 2.156 4.919 5.406.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 5.255-4.919 5.404-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-2.199-4.919-5.404-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-5.255 4.919-5.406 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  return <MessageCircle size={24} className="text-[#3F6B4F] transition-transform hover:scale-110" />;
};

export default function AuthorReviewModal({
  story: initialStory,
  onClose,
  onSubmitForReview,
}: AuthorReviewModalProps) {
  const [story, setStory] = useState<BlogPost>(initialStory);
  const [loadingFullPayload, setLoadingFullPayload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let active = true;
    const loadFullStoryDetails = async () => {
      if (initialStory.blocks && initialStory.blocks.length > 0) return;
      if (!initialStory._id) return;

      setLoadingFullPayload(true);
      try {
        const fullData = await blogsApi.getBlogById(initialStory._id);
        if (active && fullData) {
          setStory(fullData);
        }
      } catch (err) {
        console.error('Failed to load full author story payload:', err);
      } finally {
        if (active) setLoadingFullPayload(false);
      }
    };

    loadFullStoryDetails();
    return () => {
      active = false;
    };
  }, [initialStory]);

  const handleFinalSubmit = async () => {
    setModalError(null);
    setSubmitting(true);
    try {
      const submitPromise = onSubmitForReview();
      onClose();
      await submitPromise;
    } catch (error: unknown) {
      console.error('Failed to submit story from review modal:', error);
      const msg = error instanceof Error ? error.message : "Failed to submit story.";
      setModalError(msg);
      setSubmitting(false);
    }
  };

  const creator = story.originalAuthor || story.author;
  const authorFullName = creator?.firstName
    ? `${creator.firstName} ${creator.lastName || ''}`.trim()
    : creator?.username || 'BioCap Contributor';
  const authorJobTitle = creator?.jobTitle?.trim() || '';
  const authorDisplayByline = authorJobTitle
    ? `${authorFullName} (${authorJobTitle})`
    : authorFullName;

  const publishedLabel = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : story.createdAt
    ? new Date(story.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: 'var(--font-body)' };
  const displayFont: React.CSSProperties = { fontFamily: 'var(--font-display)' };
  const monoFont: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

  const isFilteredOrgLink =
    story.organizationLink &&
    !story.organizationLink.includes('realgreengoldltd.com');

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`${fontVars} fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E2620]/50 p-4 backdrop-blur-md animate-in fade-in duration-150`}
      style={bodyFont}
    >
      <style>{`
        .editor-link,
        .editor-link *,
        a.editor-link,
        a.editor-link * {
          color: #0057FF !important;
          text-decoration: underline !important;
          text-decoration-color: #0057FF !important;
          text-underline-offset: 2px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          display: inline !important;
        }
        .editor-link:hover,
        .editor-link *:hover {
          color: #003DB8 !important;
          text-decoration-color: #003DB8 !important;
        }
      `}</style>

      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden border border-[#D9D4C6] bg-[#FDFCFA] shadow-2xl rounded-sm">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D9D4C6] bg-[#F3F2ED] px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="border border-[#D9D4C6] bg-white p-1.5 text-[#3F6B4F]">
              <Eye size={16} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#8B9188]" style={monoFont}>
                Author Reader Preview
              </p>
              <h3 className="text-[15px] italic leading-tight text-[#1E2620]" style={displayFont}>
                Review your story before final submission
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border border-transparent p-1.5 text-[#8B9188] transition-colors hover:border-[#D9D4C6] hover:text-[#1E2620] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Error Banner */}
        {modalError && (
          <div className="flex items-center gap-3 border-b border-[#B65C4B] bg-[#FBEEEC] px-6 py-3 shrink-0">
            <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
            <p className="text-xs font-semibold text-[#7A362A]">{modalError}</p>
          </div>
        )}

        {/* Scrollable Article Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8 bg-white">
          <div className="space-y-3.5 border-b border-[#EDEAE0] pb-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-[#C22055] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <Tag size={11} /> {story.tag || 'General'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl italic text-[#1B3A5C] leading-snug font-bold" style={displayFont}>
              {story.title || 'Untitled Story'}
            </h1>

            <div className="flex items-center gap-5 text-xs text-[#6B7268] font-medium flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5 text-[#1B3A5C] font-semibold">
                <User size={13} className="text-[#1B3A5C]" /> By {authorDisplayByline}
              </span>
              <span className="inline-flex items-center gap-1.5" style={monoFont}>
                <Calendar size={13} className="text-[#8B9188]" /> {publishedLabel}
              </span>
            </div>
          </div>

          {/* 🟢 DYNAMIC COVER IMAGE PREVIEW CONTAINER */}
          {story.img && (
            <div className="group relative flex max-h-[600px] w-full items-center justify-center overflow-hidden border border-[#D9D4C6] bg-[#1E2620] rounded-xl">
              <img 
                src={story.img} 
                alt="Story Cover Preview" 
                className="max-h-[600px] w-full object-contain rounded-xl" 
              />
              <span
                className="absolute bottom-3 left-3 border border-white/20 bg-[#1E2620]/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A9812F] backdrop-blur-xs rounded"
                style={monoFont}
              >
                Cover Image Preview
              </span>
            </div>
          )}

          {/* Excerpt Summary */}
          {story.excerpt && (
            <div className="border-l-[3px] border-[#C22055] bg-slate-50 p-4 text-xs sm:text-sm italic text-[#3A4239] leading-relaxed">
              &quot;{story.excerpt}&quot;
            </div>
          )}

          {/* Article Body Blocks */}
          {loadingFullPayload ? (
            <div className="space-y-4 animate-pulse py-4">
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
              <div className="h-32 w-full bg-slate-100 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {story.blocks && story.blocks.length > 0 ? (
                story.blocks.map((block: BlogBlock, idx: number) => {
                  if (block.type === 'h2') {
                    return (
                      <h2 key={idx} className="text-xl font-bold text-[#1B3A5C] mt-6 mb-2" style={displayFont}>
                        {block.text}
                      </h2>
                    );
                  }

                  if (block.type === 'quote') {
                    return (
                      <blockquote key={idx} className="border-l-[3px] border-[#C22055] pl-4 py-1 my-4 italic text-slate-700 text-xs sm:text-sm leading-relaxed">
                        <span dangerouslySetInnerHTML={{ __html: formatMarkdownLinks(block.text || '') }} />
                        {block.caption && (
                          <footer className="mt-1.5 not-italic text-[10px] font-bold uppercase tracking-widest text-[#C22055]" style={monoFont}>
                            — {block.caption}
                          </footer>
                        )}
                      </blockquote>
                    );
                  }

                  const imageUrl = block.src || block.url || (block as BlogBlock & { imagePreview?: string }).imagePreview;

                  if (block.type === 'image' && imageUrl) {
                    return (
                      <figure key={idx} className="my-6 space-y-2">
                        {/* 🟢 DYNAMIC INLINE SECTION IMAGE CONTAINER */}
                        <div className="max-h-[550px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex justify-center items-center">
                          <img
                            src={imageUrl}
                            alt={block.caption || `Section ${idx + 1}`}
                            className="max-h-[550px] w-full object-contain rounded-xl"
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

                  return (
                    <div key={idx}>
                      {(block.text || '').split(/\n+/).map((paragraphText, pIdx) => (
                        <p
                          key={pIdx}
                          className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify mb-3"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownLinks(paragraphText.trim()) }}
                        />
                      ))}
                    </div>
                  );
                })
              ) : story.bodyHtml ? (
                <div
                  className="prose text-xs sm:text-sm leading-relaxed text-slate-700"
                  dangerouslySetInnerHTML={{ __html: formatMarkdownLinks(story.bodyHtml) }}
                />
              ) : (
                <p className="text-xs italic text-[#8B9188]">No article content body available.</p>
              )}
            </div>
          )}

          {/* Author Social Handles & Attached PDF Documents */}
          {(() => {
            const blogHandle = story.socialHandle?.trim();
            const authorHandle = story.originalAuthor?.socialHandle?.trim() || story.author?.socialHandle?.trim();
            const isDefaultHandle = !blogHandle || blogHandle.toLowerCase() === "@biocap" || blogHandle.toLowerCase() === "biocap";
            const rawSocialHandle = isDefaultHandle && authorHandle ? authorHandle : (blogHandle || authorHandle || "");

            if (!rawSocialHandle && !isFilteredOrgLink && !story.document && !story.documentUrl) {
              return null;
            }

            return (
              <div className="pt-6 border-t border-[#EDEAE0] space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B9188]" style={monoFont}>
                  Attached Social Handles &amp; Documents
                </p>
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
                      <Globe size={24} />
                    </a>
                  )}

                  {(story.document || story.documentUrl) && (
                    <a
                      href={story.documentUrl || (typeof story.document === 'string' ? story.document : '')}
                      target="_blank"
                      rel="noreferrer"
                      title={story.documentName || 'Download Document PDF'}
                      className="inline-flex items-center justify-center text-[#2F8F5B] hover:text-[#C22055] transition-transform hover:scale-110"
                    >
                      <FileText size={24} />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-[#D9D4C6] px-6 py-4 bg-[#FAF9F5] shrink-0">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 border border-[#D9D4C6] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3A4239] hover:border-[#1E2620] hover:text-[#1E2620] transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Continue Editing
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleFinalSubmit}
            className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Submitting...' : 'Submit Story'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}