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
  const [localStory, setLocalStory] = useState<BlogPost>(story);
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

  const editorFeedbackNote = localStory.lastRejectionNote || null;

  // Change Requests State
  const [implementingChange, setImplementingChange] = useState<ChangeRequest | null>(null);
  const [implementationNote, setImplementationNote] = useState("");
  const [isImplementing, setIsImplementing] = useState(false);

  // 🟢 INSTANT RETURN SUBMISSION HANDLER
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

      // 1. Send update request
      await blogsApi.updateBlog(
        localStory._id,
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
        await blogsApi.submitBlog(localStory._id, currentUserRole);
      }

      setIsSubmitting(false);
      onStoryUpdated();
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update story:", error);
      const msg = error instanceof Error ? error.message : "Failed to save story changes.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const openImplementModal = (cr: ChangeRequest) => {
    setImplementingChange(cr);
    setImplementationNote(cr.implementationNote || "");
  };

  // 🟢 CONFIRM IMPLEMENTED: Updates backend and instantly removes/marks change in local UI
  const handleConfirmImplement = async () => {
    if (!implementingChange || !implementingChange._id) return;
    setIsImplementing(true);
    try {
      await blogsApi.markChangeImplemented(
        localStory._id,
        {
          changeId: implementingChange._id,
          implementationNote: implementationNote || undefined,
        },
        currentUserRole
      );

      // Update local story state so the change request disappears or reflects implemented status instantly
      setLocalStory((prev) => {
        if (!prev.changeRequests) return prev;
        const updatedRequests = prev.changeRequests.map((cr) => {
          if (cr._id === implementingChange._id) {
            return {
              ...cr,
              implemented: true,
              implementedAt: new Date().toISOString(),
              implementationNote: implementationNote || cr.implementationNote,
            };
          }
          return cr;
        });
        return { ...prev, changeRequests: updatedRequests };
      });

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
    "w-full border border-[#D9D4C6] bg-white px-3.5 py-2.5 text-xs text-[#1E2620] placeholder:text-[#8B9188] transition-colors focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15";
  const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#1E2620]";

  const btnBase =
    "inline-flex items-center gap-1.5 border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
  const btnNeutral = `${btnBase} border-[#D9D4C6] bg-white text-[#3A4239] hover:border-[#1E2620] hover:text-[#1E2620]`;
  const btnMoss = `${btnBase} border-[#3F6B4F] bg-[#3F6B4F] text-white hover:bg-[#345A42]`;
  const btnGold = `${btnBase} border-[#A9812F] bg-[#A9812F] text-white hover:bg-[#8C6721]`;

  const openChangeRequests = localStory.changeRequests
    ? localStory.changeRequests.filter((c) => !c.implemented)
    : [];

  return (
    <div
      /* 🟢 z-[99999] prevents the top navigation header from overlapping the modal */
      className={`${fontVars} fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6`}
      style={bodyFont}
    >
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden border border-[#D9D4C6] bg-white shadow-2xl rounded-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2DDCF] bg-[#F7F6F2] px-6 py-4">
          <div>
            <p
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3F6B4F]"
              style={monoFont}
            >
              <FileText size={13} /> Manuscript Workspace
            </p>
            <h3 className="mt-0.5 text-xl font-bold italic text-[#1E2620]" style={displayFont}>
              Edit Story Draft
            </h3>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close"
            className="border border-[#D9D4C6] bg-white p-1.5 text-[#1E2620] transition-colors hover:bg-[#1E2620] hover:text-white cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 bg-white">
          
          {/* 🟢 High-contrast Editor Feedback Banner */}
          {editorFeedbackNote && (
            <div className="border-l-4 border-amber-600 bg-amber-50 p-4 shadow-xs">
              <div
                className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900"
                style={monoFont}
              >
                <MessageSquare size={14} className="text-amber-700" /> Editor Feedback &amp; Revision Request
              </div>
              <p className="text-xs font-semibold leading-relaxed text-amber-950">{editorFeedbackNote}</p>
            </div>
          )}

          {/* Change Requests Section */}
          {openChangeRequests.length > 0 && (
            <div className="border border-[#E2DDCF] bg-white">
              <div className="flex items-center justify-between border-b border-[#EDEAE0] px-5 py-3 bg-[#FAF9F5]">
                <p
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1E2620]"
                  style={monoFont}
                >
                  <FileText size={12} /> Requested Revisions ({openChangeRequests.length})
                </p>
                <span
                  className="border border-[#B65C4B] bg-[#B65C4B] px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                  style={monoFont}
                >
                  Action Required
                </span>
              </div>

              <div className="divide-y divide-[#EDEAE0]">
                {openChangeRequests.map((cr, idx) => {
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
                      className="p-4 bg-rose-50/20"
                      style={{ boxShadow: `inset 4px 0 0 #B65C4B` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#E2DDCF] bg-white text-[#1E2620]">
                            <User size={13} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1E2620]">
                              {commenterName}
                              {cr.role && (
                                <span className="ml-1 font-semibold text-[#5A6259]"> — {cr.role}</span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-[#5A6259]" style={monoFont}>
                              <Clock size={11} /> {cr.requestedAt ? new Date(cr.requestedAt).toLocaleString() : "Recently"}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openImplementModal(cr)}
                          className={`${btnGold} shrink-0 px-2.5 py-1`}
                        >
                          Mark implemented
                        </button>
                      </div>

                      <p className="mt-2.5 text-xs font-medium leading-relaxed text-[#1E2620]">{cr.comment}</p>
                    </div>
                  );
                })}
              </div>

              {/* Implement Modal Form */}
              {implementingChange && (
                <div className="border-t border-[#EDEAE0] bg-[#FAF9F5] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-[#1E2620]">Confirm Revision Implemented</p>
                    <button
                      type="button"
                      onClick={() => setImplementingChange(null)}
                      className="text-[11px] font-semibold text-[#5A6259] hover:text-[#1E2620] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className={labelCls}>Implementation note / author remark (optional)</p>
                  <textarea
                    rows={3}
                    value={implementationNote}
                    onChange={(e) => setImplementationNote(e.target.value)}
                    placeholder="Briefly describe how you resolved this requested change..."
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
            <div className="flex items-center gap-2.5 border-l-4 border-rose-600 bg-rose-50 p-3.5 text-rose-950">
              <AlertCircle size={16} className="shrink-0 text-rose-700" />
              <span className="text-xs font-bold">{errorMessage}</span>
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
                className={`${inputCls} text-sm font-bold text-[#1E2620]`}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Category Tag</label>
                <select
                  value={articleTag}
                  onChange={(e) => setArticleTag(e.target.value)}
                  className={`${inputCls} font-semibold`}
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
                  <div className="flex items-center justify-between border border-[#D9D4C6] bg-white px-3 py-2.5">
                    <span className="truncate text-xs font-semibold text-[#1E2620]">{newCoverImageFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setNewCoverImageFile(null)}
                      className="ml-2 shrink-0 text-rose-600 hover:text-rose-800 cursor-pointer"
                      aria-label="Remove selected cover image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-1.5 border border-dashed border-[#D9D4C6] bg-[#FAF9F5] px-3 py-2.5 text-[11px] font-bold text-[#1E2620] transition-colors hover:border-[#3F6B4F] hover:bg-white">
                    <ImagePlus size={14} className="text-[#3F6B4F]" /> Replace cover image
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
                <label className={labelCls}>Excerpt / brief summary</label>
                <span className="text-[10px] font-semibold tabular-nums text-[#5A6259]" style={monoFont}>
                  {articleExcerpt.length} chars
                </span>
              </div>
              <textarea
                rows={2}
                value={articleExcerpt}
                onChange={(e) => setArticleExcerpt(e.target.value)}
                placeholder="Short description for preview cards..."
                className={`${inputCls} font-medium`}
              />
            </div>

            <div>
              <label className={labelCls}>Main Story Content</label>
              <textarea
                rows={9}
                required
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                className={`${inputCls} leading-relaxed font-normal`}
                placeholder="Write your article body paragraphs here..."
              />
            </div>
          </div>

          {/* 🟢 Embedded Moderated Comments Section */}
          <div className="pt-4 border-t border-[#EDEAE0]">
            <CommentManager
              articleId={localStory._id}
              slug={localStory.slug}
              currentUserRole={currentUserRole}
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E2DDCF] bg-[#F7F6F2] px-6 py-4">
          <button type="button" disabled={isSubmitting} onClick={onClose} className={btnNeutral}>
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, false)}
            className={btnNeutral}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, true)}
            className={btnGold}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {isSubmitting ? "Submitting..." : "Save & Submit"}
          </button>
        </div>

      </div>
    </div>
  );
}