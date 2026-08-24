'use client';

import { useState } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { BlogPost, Role, BlogBlock, ChangeRequest } from "@/types";
import { blogsApi } from "@/lib/api/blogs";
import CommentManager from "@/components/CommentManager";
import {
  X,
  Save,
  Upload,
  Loader2,
  AlertCircle,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  User,
  ImagePlus,
} from "lucide-react";

// ── Editorial Type & Styling System ──────────────────────────────
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

export interface EditStoryModalProps {
  story: BlogPost;
  currentUserRole: Role;
  onClose: () => void;
  onStoryUpdated: () => void;
}

export default function EditStoryModal({
  story,
  currentUserRole,
  onClose,
  onStoryUpdated,
}: EditStoryModalProps) {
  const [articleTitle, setArticleTitle] = useState(story.title || "");
  const [articleTag, setArticleTag] = useState(story.tag || "General");
  const [articleExcerpt, setArticleExcerpt] = useState(story.excerpt || "");
  const [articleContent, setArticleContent] = useState(() => {
    if (Array.isArray(story.blocks) && story.blocks.length > 0) {
      return story.blocks.map((b) => b.text || "").filter(Boolean).join("\n\n");
    }
    return (story as any).content || "";
  });
  const [newCoverImageFile, setNewCoverImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editorFeedbackNote = story.lastRejectionNote || null;

  // Change Requests State
  const [implementingChange, setImplementingChange] = useState<ChangeRequest | null>(null);
  const [implementationNote, setImplementationNote] = useState("");
  const [isImplementing, setIsImplementing] = useState(false);

  const handleUpdateStory = async (e: React.FormEvent, submitForReview = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Structure paragraph blocks with explicit string typing
      const updatedBlocks: BlogBlock[] = articleContent
        .split("\n\n")
        .filter((paragraph: string) => paragraph.trim().length > 0)
        .map((text: string): BlogBlock => ({
          type: "p",
          text: text.trim(),
        }));

      // 1. Update story details via blogsApi.updateBlog
      await blogsApi.updateBlog(
        story._id,
        {
          title: articleTitle,
          tag: articleTag,
          excerpt: articleExcerpt,
          blocks: updatedBlocks.length > 0 ? updatedBlocks : [{ type: "p", text: articleContent }],
          ...(newCoverImageFile && { img: newCoverImageFile }),
        },
        currentUserRole
      );

      // 2. Submit for review if requested
      if (submitForReview) {
        await blogsApi.submitBlog(story._id, currentUserRole);
      }

      onStoryUpdated();
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update story:", error);
      const msg = error instanceof Error ? error.message : "Failed to save story changes.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImplementModal = (cr: ChangeRequest) => {
    setImplementingChange(cr);
    setImplementationNote(cr.implementationNote || "");
  };

  const handleConfirmImplement = async () => {
    if (!implementingChange || !implementingChange._id) return;
    setIsImplementing(true);
    try {
      await blogsApi.markChangeImplemented(
        story._id,
        {
          changeId: implementingChange._id,
          implementationNote: implementationNote || undefined,
        },
        currentUserRole
      );

      // Refresh parent list/detail
      onStoryUpdated();
      setImplementingChange(null);
      setImplementationNote("");
    } catch (err) {
      console.error("Failed to mark change implemented:", err);
      alert("Failed to mark change implemented.");
    } finally {
      setIsImplementing(false);
    }
  };

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  const inputCls =
    "w-full border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-2.5 text-xs text-[#1E2620] placeholder:text-[#B4B0A2] transition-colors focus:border-[#3F6B4F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15";
  const labelCls = "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]";

  const btnBase =
    "inline-flex items-center gap-1.5 border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
  const btnNeutral = `${btnBase} border-[#D9D4C6] bg-white text-[#3A4239] hover:border-[#1E2620] hover:text-[#1E2620]`;
  const btnMoss = `${btnBase} border-[#3F6B4F]/40 bg-[#3F6B4F]/10 text-[#2C4B38] hover:bg-[#3F6B4F] hover:text-white hover:border-[#3F6B4F]`;
  const btnGold = `${btnBase} border-[#A9812F]/40 bg-[#A9812F]/10 text-[#7A5D22] hover:bg-[#A9812F] hover:text-white hover:border-[#A9812F]`;

  return (
    <div
      className={`${fontVars} fixed inset-0 z-50 flex items-center justify-center bg-[#1E2620]/45 backdrop-blur-xs p-4`}
      style={bodyFont}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border border-[#E2DDCF] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-[#E2DDCF] bg-[#FAF9F5] px-6 py-4">
          <div>
            <p
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3F6B4F]"
              style={monoFont}
            >
              <FileText size={12} /> Manuscript Workspace
            </p>
            <h3 className="mt-0.5 text-xl italic text-[#1E2620]" style={displayFont}>
              Edit Story Draft
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border border-transparent p-1.5 text-[#8B9188] transition-colors hover:border-[#D9D4C6] hover:text-[#1E2620] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          
          {/* Editor Feedback Banner */}
          {editorFeedbackNote && (
            <div className="border border-[#A9812F]/40 bg-[#A9812F]/10 p-4">
              <div
                className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#7A5D22]"
                style={monoFont}
              >
                <MessageSquare size={13} /> Editor Feedback &amp; Revision Request
              </div>
              <p className="text-xs leading-relaxed text-[#7A5D22]/90">{editorFeedbackNote}</p>
            </div>
          )}

          {/* Change Requests Section */}
          {story.changeRequests && story.changeRequests.length > 0 && (
            <div className="border border-[#E2DDCF] bg-white">
              <div className="flex items-center justify-between border-b border-[#EDEAE0] px-5 py-3">
                <p
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]"
                  style={monoFont}
                >
                  <FileText size={12} /> Change Requests
                </p>
                <span
                  className="border border-[#D9D4C6] bg-[#F3F2ED] px-2 py-0.5 text-[10px] font-bold text-[#5A6259]"
                  style={monoFont}
                >
                  {story.changeRequests.filter((c) => !c.implemented).length} open
                </span>
              </div>

              <div className="divide-y divide-[#EDEAE0]">
                {story.changeRequests.map((cr, idx) => {
                  const commenterObj = cr.commenter as any;
                  const commenterName =
                    typeof cr.commenter === "string"
                      ? cr.commenter
                      : commenterObj?.firstName
                      ? `${commenterObj.firstName} ${commenterObj.lastName || ""}`.trim()
                      : commenterObj?.username || "Reviewer";

                  return (
                    <div
                      key={cr._id || idx}
                      className="p-4"
                      style={{ boxShadow: `inset 3px 0 0 ${cr.implemented ? "#3F6B4F" : "#B65C4B"}` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#E2DDCF] bg-[#F3F2ED] text-[#5A6259]">
                            <User size={13} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#1E2620]">
                              {commenterName}
                              {cr.role && (
                                <span className="ml-1 font-normal text-[#8B9188]"> — {cr.role}</span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#B4B0A2]" style={monoFont}>
                              <Clock size={11} /> {cr.requestedAt ? new Date(cr.requestedAt).toLocaleString() : "Recently"}
                            </div>
                          </div>
                        </div>

                        {cr.implemented ? (
                          <span
                            className="inline-flex shrink-0 items-center gap-1 border border-[#3F6B4F]/40 bg-[#3F6B4F]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2C4B38]"
                            style={monoFont}
                          >
                            <CheckCircle2 size={12} /> Implemented
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openImplementModal(cr)}
                            className={`${btnGold} shrink-0 px-2.5 py-1`}
                          >
                            Mark implemented
                          </button>
                        )}
                      </div>

                      <p className="mt-2.5 text-[13px] leading-relaxed text-[#3A4239]">{cr.comment}</p>

                      {cr.implemented && cr.implementationNote && (
                        <div className="mt-2.5 border border-[#3F6B4F]/25 bg-[#3F6B4F]/5 p-2.5">
                          <p
                            className="text-[10px] font-semibold uppercase tracking-wider text-[#2C4B38]"
                            style={monoFont}
                          >
                            Implementation Note
                          </p>
                          <p className="mt-0.5 text-xs text-[#2C4B38]/90">{cr.implementationNote}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Implement Modal Form */}
              {implementingChange && (
                <div className="border-t border-[#EDEAE0] bg-[#FAF9F5] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#1E2620]">Mark Change Implemented</p>
                    <button
                      type="button"
                      onClick={() => setImplementingChange(null)}
                      className="text-[11px] font-medium text-[#8B9188] hover:text-[#1E2620] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className={labelCls}>Implementation note (optional)</p>
                  <textarea
                    rows={3}
                    value={implementationNote}
                    onChange={(e) => setImplementationNote(e.target.value)}
                    className={inputCls}
                  />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setImplementingChange(null)} className={btnNeutral}>
                      Cancel
                    </button>
                    <button type="button" onClick={handleConfirmImplement} disabled={isImplementing} className={btnMoss}>
                      {isImplementing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      Confirm Implemented
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-3.5 text-[#8B4136]">
              <AlertCircle size={15} className="shrink-0" />
              <span className="text-xs font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Edit Form Fields */}
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Article Title</label>
              <input
                type="text"
                required
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                className={`${inputCls} font-semibold text-[#1E2620]`}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Category Tag</label>
                <select
                  value={articleTag}
                  onChange={(e) => setArticleTag(e.target.value)}
                  className={inputCls}
                >
                  <option value="General">General</option>
                  <option value="Agribusiness">Agribusiness</option>
                  <option value="Technology">Technology</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="BioCap">BioCap</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Cover Image</label>
                {newCoverImageFile ? (
                  <div className="flex items-center justify-between border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-2.5">
                    <span className="truncate text-xs text-[#1E2620]">{newCoverImageFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setNewCoverImageFile(null)}
                      className="ml-2 shrink-0 text-[#B65C4B] hover:opacity-70 cursor-pointer"
                      aria-label="Remove selected cover image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-1.5 border border-dashed border-[#D9D4C6] bg-[#FAF9F5] px-3 py-2.5 text-[11px] font-medium text-[#8B9188] transition-colors hover:border-[#3F6B4F] hover:bg-[#F3F2ED] hover:text-[#3F6B4F]">
                    <ImagePlus size={14} /> Replace cover image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewCoverImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
                  Excerpt / brief summary
                </label>
                <span className="text-[10px] tabular-nums text-[#B4B0A2]" style={monoFont}>
                  {articleExcerpt.length} chars
                </span>
              </div>
              <textarea
                rows={2}
                value={articleExcerpt}
                onChange={(e) => setArticleExcerpt(e.target.value)}
                placeholder="Short description for preview cards..."
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Main Story Content</label>
              <textarea
                rows={8}
                required
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                className={`${inputCls} leading-relaxed`}
                placeholder="Write your article body paragraphs here..."
              />
            </div>
          </div>

          {/* Embedded Moderated Comments Section */}
          <div className="pt-4 border-t border-[#EDEAE0]">
            <CommentManager
              articleId={story._id}
              currentUserRole={currentUserRole}
            />
          </div>

        </div>

        {/* ── Footer Actions ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E2DDCF] bg-[#FAF9F5] px-6 py-4">
          <button type="button" onClick={onClose} className={btnNeutral}>
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, false)}
            className={btnNeutral}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, true)}
            className={btnGold}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            Save &amp; Submit
          </button>
        </div>

      </div>
    </div>
  );
}