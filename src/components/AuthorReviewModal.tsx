'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { BlogPost } from '@/types';
import {
  X,
  Send,
  Loader2,
  Calendar,
  User,
  Tag,
  Globe,
  AtSign,
  ArrowLeft,
  Eye,
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

export default function AuthorReviewModal({
  story,
  onClose,
  onSubmitForReview,
}: AuthorReviewModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmitForReview();
      onClose();
    } catch (error) {
      console.error('Failed to submit story from review modal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const authorFullName = story.author?.firstName
    ? `${story.author.firstName} ${story.author.lastName || ''}`.trim()
    : story.author?.username || 'Contributor';

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: 'var(--font-body)' };
  const displayFont: React.CSSProperties = { fontFamily: 'var(--font-display)' };
  const monoFont: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`${fontVars} fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E2620]/50 p-4 backdrop-blur-md animate-in fade-in duration-150`}
      style={bodyFont}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-[#D9D4C6] bg-[#FDFCFA] shadow-2xl rounded-sm">
        
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

        {/* Scrollable Article Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 space-y-8 bg-white">
          
          {/* Article Category & Title Header */}
          <div className="space-y-3.5 border-b border-[#EDEAE0] pb-6">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-[#FAF9F5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3A4239]"
                style={monoFont}
              >
                <Tag size={11} className="text-[#3F6B4F]" /> {story.tag || 'General'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl italic text-[#1E2620] leading-snug" style={displayFont}>
              {story.title || 'Untitled Story'}
            </h1>

            <div className="flex items-center gap-5 text-xs text-[#6B7268] font-medium flex-wrap pt-1">
              <span className="inline-flex items-center gap-1.5">
                <User size={13} className="text-[#8B9188]" /> By {authorFullName}
              </span>
              <span className="inline-flex items-center gap-1.5" style={monoFont}>
                <Calendar size={13} className="text-[#8B9188]" /> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Cover Image Preview */}
          {story.img && (
            <div className="group relative flex max-h-[400px] items-center justify-center overflow-hidden border border-[#D9D4C6] bg-[#1E2620]">
              <img
                src={story.img}
                alt="Story Cover Preview"
                className="max-h-[400px] w-full object-contain"
              />
              <span
                className="absolute bottom-3 left-3 border border-white/20 bg-[#1E2620]/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A9812F] backdrop-blur-xs"
                style={monoFont}
              >
                Cover Image Preview
              </span>
            </div>
          )}

          {/* Excerpt Summary Card */}
          {story.excerpt && (
            <div className="border-l-2 border-[#3F6B4F] bg-[#FAF9F5] p-4 text-xs italic text-[#3A4239] leading-relaxed">
              "{story.excerpt}"
            </div>
          )}

          {/* Story Body Blocks */}
          <div className="space-y-5 pt-2">
            {story.blocks && story.blocks.length > 0 ? (
              story.blocks.map((block: any, idx: number) => {
                if (block.type === 'h2') {
                  return (
                    <h2 key={idx} className="text-lg sm:text-xl italic font-semibold text-[#1E2620] mt-6 mb-2" style={displayFont}>
                      {block.text}
                    </h2>
                  );
                }

                if (block.type === 'quote') {
                  return (
                    <blockquote
                      key={idx}
                      className="border-l-2 border-[#A9812F] pl-4 py-1 my-4 italic text-[#3A4239] text-xs sm:text-sm leading-relaxed"
                    >
                      {block.text}
                      {block.caption && (
                        <footer className="mt-1.5 not-italic text-[10px] font-bold uppercase tracking-wider text-[#A9812F]" style={monoFont}>
                          — {block.caption}
                        </footer>
                      )}
                    </blockquote>
                  );
                }

                // Checks imagePreview, src, and url for inline body images
                const imageUrl = block.src || block.url || block.imagePreview;

                if (block.type === 'image' && imageUrl) {
                  return (
                    <figure key={idx} className="my-5 space-y-2">
                      <div className="max-h-80 overflow-hidden border border-[#D9D4C6] bg-[#1E2620] flex justify-center items-center">
                        <img
                          src={imageUrl}
                          alt={block.caption || `Section ${idx + 1}`}
                          className={`max-h-80 w-full ${
                            block.fitMode === 'contain' ? 'object-contain' : 'object-cover'
                          }`}
                        />
                      </div>
                      {block.caption && (
                        <figcaption className="text-center text-[11px] italic text-[#8B9188] pt-1">
                          {block.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }

                return (
                  <p
                    key={idx}
                    className="text-xs sm:text-sm text-[#3A4239] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: block.text || '' }}
                  />
                );
              })
            ) : (
              <p className="text-xs italic text-[#8B9188]">No manuscript sections provided yet.</p>
            )}
          </div>

          {/* Author Credentials */}
          {(story.socialHandle || story.organizationLink) && (
            <div className="pt-6 border-t border-[#EDEAE0] space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B9188]" style={monoFont}>
                Attached Credentials
              </p>
              <div className="flex items-center gap-5 flex-wrap text-xs text-[#3A4239]">
                {story.socialHandle && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <AtSign size={14} className="text-[#3F6B4F]" /> {story.socialHandle}
                  </span>
                )}
                {story.organizationLink && (
                  <a
                    href={story.organizationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[#3F6B4F] hover:underline"
                  >
                    <Globe size={14} /> {story.organizationLink}
                  </a>
                )}
              </div>
            </div>
          )}

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