'use client';

import { useState } from "react";
import { BlogPost, Role, BlogBlock } from "@/types";
import { blogsApi } from "@/lib/api/blogs";
import {
  X,
  Save,
  Upload,
  Loader2,
  AlertCircle,
  MessageSquare,
  FileText,
} from "lucide-react";

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
  const [articleContent, setArticleContent] = useState(story.blocks?.[0]?.text || "");
  const [newCoverImageFile, setNewCoverImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editorFeedbackNote = story.lastRejectionNote || null;

  const handleUpdateStory = async (e: React.FormEvent, submitForReview = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const updatedBlocks: BlogBlock[] = [
        {
          type: "p",
          text: articleContent,
        },
      ];

      // 1. Update story details via blogsApi.updateBlog
      await blogsApi.updateBlog(
        story._id,
        {
          title: articleTitle,
          tag: articleTag,
          excerpt: articleExcerpt,
          blocks: updatedBlocks,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-600" size={18} />
            <h3 className="text-base font-bold text-slate-900">Edit Story Draft</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {editorFeedbackNote && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-xs mb-1">
                <MessageSquare size={14} /> Editor Feedback & Revision Request:
              </div>
              <p className="text-xs font-medium text-amber-800/90">{editorFeedbackNote}</p>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Article Title
              </label>
              <input
                type="text"
                required
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category Tag
                </label>
                <select
                  value={articleTag}
                  onChange={(e) => setArticleTag(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Agribusiness">Agribusiness</option>
                  <option value="Technology">Technology</option>
                  <option value="Sustainability">Sustainability</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Replace Cover Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCoverImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Excerpt
              </label>
              <textarea
                rows={2}
                value={articleExcerpt}
                onChange={(e) => setArticleExcerpt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Main Story Content
              </label>
              <textarea
                rows={8}
                required
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, false)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Save & Submit
          </button>
        </div>
      </div>
    </div>
  );
}