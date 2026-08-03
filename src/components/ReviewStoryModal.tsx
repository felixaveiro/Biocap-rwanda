'use client';

import { useState, useEffect, useCallback } from "react";
import { BlogPost, Role, Comment } from "@/types";
import { blogsApi, officerApi } from "@/lib/api/blogs";
import ImageCropperModal from "@/components/ImageCropperModal";
import { base64ToFile } from "@/lib/utils/file";
import {
  X,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  AlertCircle,
  Tag,
  User as UserIcon,
  Crop,
  Send,
  Clock,
  Edit3,
} from "lucide-react";

interface ReviewStoryModalProps {
  story: BlogPost;
  currentUserRole: Role;
  onClose: () => void;
  onReviewCompleted: () => void;
}

export default function ReviewStoryModal({
  story,
  currentUserRole,
  onClose,
  onReviewCompleted,
}: ReviewStoryModalProps) {
  const [revisionFeedbackNote, setRevisionFeedbackNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── Editable Content States (for Editor Edits) ─────────────────────────
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(story.title || "");
  const [editedExcerpt, setEditedExcerpt] = useState(story.excerpt || "");
  const [editedContentText, setEditedContentText] = useState(story.blocks?.[0]?.text || "");

  // ─── Image & Cropping States ───────────────────────────────────────────────
  const [currentImgUrl, setCurrentImgUrl] = useState<string>(story.img || "");
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // ─── Discussion / Comments States ─────────────────────────────────────────
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const isEditor = currentUserRole === "editor";
  const isOfficer = currentUserRole === "communication_officer" || currentUserRole === "admin";
  const isPublished = story.status === "published";

  // Author Display Name Resolution
  const authorName = story.author?.firstName
    ? `${story.author.firstName} ${story.author.lastName || ""}`.trim()
    : story.author?.username || story.originalAuthor?.firstName || "Contributor";

  const fetchComments = useCallback(async () => {
    if (!story._id) return;
    try {
      const data = await officerApi.getArticleComments(story._id);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch comments for story:", err);
    }
  }, [story._id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCropSave = (croppedBase64: string) => {
    setCurrentImgUrl(croppedBase64);
    const file = base64ToFile(croppedBase64, `cropped-${story._id}.jpg`);
    setCroppedImageFile(file);
    setIsCropperOpen(false);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await officerApi.addArticleComment(story._id, newCommentText.trim());
      if (res.comment) {
        setComments((prev) => [...prev, res.comment]);
      } else {
        await fetchComments();
      }
      setNewCommentText("");
    } catch (err: any) {
      alert(err.message || "Failed to post comment.");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDecision = async (decision: "approve" | "reject") => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (decision === "approve") {
        // 1. If Editor made text edits or cropped the image, apply modifications first
        const hasContentEdits = 
          editedTitle !== story.title || 
          editedExcerpt !== story.excerpt || 
          editedContentText !== (story.blocks?.[0]?.text || "") || 
          croppedImageFile !== null;

        if (isEditor && hasContentEdits) {
          await blogsApi.updateBlog(
            story._id,
            {
              title: editedTitle,
              excerpt: editedExcerpt,
              blocks: [{ type: "p", text: editedContentText }],
              ...(croppedImageFile && { img: croppedImageFile }),
            },
            currentUserRole
          );
        }

        // 2. Perform role-specific approval
        if (isOfficer && story.editorModifications) {
          await officerApi.acceptEditorChanges(story._id, {
            approvalNote: revisionFeedbackNote,
          });
        } else {
          await blogsApi.approveBlog(story._id, currentUserRole);
        }
      } else {
        if (!revisionFeedbackNote.trim()) {
          setErrorMessage("Please enter revision notes before requesting changes.");
          setIsSubmitting(false);
          return;
        }

        await blogsApi.rejectBlog(story._id, revisionFeedbackNote, currentUserRole);
      }

      onReviewCompleted();
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${decision} story:`, error);
      const msg = error instanceof Error ? error.message : `Failed to ${decision} story.`;
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <div className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">
              {isPublished
                ? "Published Article Discussion Desk"
                : isEditor
                ? "Editor Review & Revision Workspace"
                : "Review Story Submission"}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Article Preview / Edit Column */}
              <div className="lg:col-span-2 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                      <Tag size={12} /> {story.tag || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <UserIcon size={12} /> Author: {authorName}
                    </span>
                  </div>

                  {isEditor && !isPublished && (
                    <button
                      type="button"
                      onClick={() => setIsEditingContent(!isEditingContent)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit3 size={13} />
                      {isEditingContent ? "View Mode" : "Edit Story Content"}
                    </button>
                  )}
                </div>

                {isEditingContent ? (
                  /* Editor Editing Form Mode */
                  <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-indigo-900 mb-1">Title</label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-indigo-900 mb-1">Excerpt</label>
                      <textarea
                        rows={2}
                        value={editedExcerpt}
                        onChange={(e) => setEditedExcerpt(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-indigo-900 mb-1">Body Text</label>
                      <textarea
                        rows={6}
                        value={editedContentText}
                        onChange={(e) => setEditedContentText(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  /* Standard Story Display Mode */
                  <>
                    <h2 className="text-xl font-bold text-slate-900">{editedTitle}</h2>

                    {currentImgUrl && (
                      <div className="relative group overflow-hidden rounded-xl bg-slate-100 max-h-64 shadow-xs">
                        <img
                          src={currentImgUrl}
                          alt={story.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCropperOpen(true)}
                          className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md shadow-md hover:bg-slate-900 transition"
                        >
                          <Crop size={14} className="text-[#E52B67]" />
                          Crop & Align Image
                        </button>
                      </div>
                    )}

                    {editedExcerpt && (
                      <p className="rounded-xl bg-slate-50 p-3 text-xs italic font-medium text-slate-600">
                        "{editedExcerpt}"
                      </p>
                    )}

                    <div className="prose prose-slate max-w-none text-xs text-slate-800 space-y-2">
                      <p>{editedContentText}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar: Editorial Controls & Decision Panel */}
              <div className="space-y-6">
                {!isPublished && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">
                      {isEditor ? "Review & Editorial Action" : "Editorial Decision"}
                    </h4>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <MessageSquare size={13} /> Notes / Instructions
                      </label>
                      <textarea
                        rows={4}
                        value={revisionFeedbackNote}
                        onChange={(e) => setRevisionFeedbackNote(e.target.value)}
                        placeholder="Leave editorial remarks or feedback..."
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision("approve")}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {isEditor
                          ? "Approve for Publication"
                          : story.editorModifications
                          ? "Accept Editor Changes"
                          : "Approve Article"}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision("reject")}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Request Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Team Discussion & Comments Thread */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <MessageSquare size={13} className="text-indigo-600" /> Team Discussion (
                    {comments.length})
                  </h4>

                  <form onSubmit={handlePostComment} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Add an internal note..."
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={isPostingComment || !newCommentText.trim()}
                      className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Send size={12} /> {isPostingComment ? "Posting…" : "Post Comment"}
                    </button>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-800">
                            {comment.user
                              ? `${comment.user.firstName} ${comment.user.lastName}`
                              : "Editor"}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                            <Clock size={9} />
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentImgUrl && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={currentImgUrl}
          aspectRatio={16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onSave={handleCropSave}
        />
      )}
    </>
  );
}