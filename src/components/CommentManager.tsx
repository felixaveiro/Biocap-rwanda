'use client';

import React, { useState, useEffect, useCallback } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import { Comment, Role } from "@/types";
import { blogsApi } from "@/lib/api/blogs";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  EyeOff, 
  Eye, 
  Trash2, 
  Loader2, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

interface CommentManagerProps {
  articleId: string;
  slug?: string;
  currentUserRole?: Role | string;
  initialComments?: Comment[];
}

export default function CommentManager({
  articleId,
  slug,
  currentUserRole,
  initialComments,
}: CommentManagerProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [isLoading, setIsLoading] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);

  // Form States for Public Visitors
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const monoFont = { fontFamily: "var(--font-mono)" };

  // Role Checks for Moderation Buttons
  const userRoleStr = Array.isArray(currentUserRole) ? currentUserRole[0] : (currentUserRole || "");
  const canModerate = ["admin", "editor", "communication_officer"].includes(userRoleStr);

  const loadComments = useCallback(async () => {
    if (!slug && !articleId) return;
    setIsLoading(true);
    setError(null);

    try {
      // 🟢 FIX: Use public route when slug is present (Public visitors)
      if (slug) {
        const data = await blogsApi.getPublicComments(slug);
        setComments(Array.isArray(data) ? data : []);
      } else {
        const data = await blogsApi.getArticleComments(articleId);
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (err: unknown) {
      // 🟢 FIX: Catch 403 gracefully and set empty comments array instead of throwing console error
      console.warn("Could not fetch comments:", err);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, slug]);

  useEffect(() => {
    if (!initialComments) {
      loadComments();
    }
  }, [initialComments, loadComments]);

  // Post top-level public audience comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      if (slug) {
        await blogsApi.addPublicComment(slug, {
          name: name.trim() || "Guest Reader",
          email: email.trim() || "reader@biocap.org",
          content: newCommentText.trim(),
        });
      } else {
        await blogsApi.addComment(articleId, {
          content: newCommentText.trim(),
          name: name.trim() || "Guest Reader",
          email: email.trim() || "reader@biocap.org",
        });
      }
      setNewCommentText("");
      await loadComments();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Moderate Comment: Hide or Unhide
  const handleToggleHide = async (commentId: string, currentIsVisible?: boolean) => {
    if (!canModerate) return;
    setActiveActionId(commentId);
    try {
      if (currentIsVisible === false) {
        await blogsApi.unhideBlogComment(articleId, commentId);
      } else {
        await blogsApi.hideBlogComment(articleId, commentId);
      }
      await loadComments();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Moderation action failed.");
    } finally {
      setActiveActionId(null);
    }
  };

  // Moderate Comment: Delete
  const handleDeleteComment = async (commentId: string) => {
    if (!canModerate) return;
    if (!confirm("Are you sure you want to permanently delete this public comment?")) return;

    setActiveActionId(commentId);
    try {
      await blogsApi.deleteBlogComment(articleId, commentId);
      await loadComments();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete action failed.");
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className={`${plexMono.variable} w-full space-y-6 border border-[#EDEAE0] bg-white p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EDEAE0] pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#3F6B4F]" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E2620]" style={monoFont}>
            Public Reader Discussion ({comments.length})
          </h4>
        </div>
        {canModerate && (
          <span className="inline-flex items-center gap-1 border border-[#3F6B4F]/30 bg-[#3F6B4F]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#3F6B4F]" style={monoFont}>
            <ShieldCheck size={11} /> Moderator Mode
          </span>
        )}
      </div>

      {/* Error Callout */}
      {error && (
        <div className="flex items-center gap-2 border-l-2 border-[#B65C4B] bg-[#FBEEEC] p-3 text-xs font-medium text-[#7A362A]">
          <AlertCircle size={15} className="shrink-0 text-[#B65C4B]" />
          <span>{error}</span>
        </div>
      )}

      {/* Public Comment Input */}
      <form onSubmit={handlePostComment} className="space-y-3">
        {!canModerate && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#D9D4C6] bg-white p-2.5 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
            />
            <input
              type="email"
              placeholder="Your Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#D9D4C6] bg-white p-2.5 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
            />
          </div>
        )}

        <textarea
          rows={3}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Share your thoughts on this story..."
          className="w-full border border-[#D9D4C6] bg-white p-3 text-xs text-[#1E2620] placeholder:text-[#8B9188] focus:border-[#3F6B4F] focus:outline-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newCommentText.trim()}
            className="inline-flex items-center gap-1.5 border border-[#1E2620] bg-[#1E2620] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-40 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>{isSubmitting ? "Posting..." : "Submit Comment"}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-xs text-[#8B9188]">
          <Loader2 size={16} className="mr-2 animate-spin text-[#3F6B4F]" /> Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-xs italic text-[#8B9188]">No public comments posted yet.</p>
      ) : (
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isHidden = comment.isVisible === false;
            const isBusy = activeActionId === comment._id;

            return (
              <div
                key={comment._id}
                className={`space-y-2 border p-3.5 transition-colors ${
                  isHidden ? "border-amber-300 bg-amber-50/50" : "border-[#EDEAE0] bg-[#FAF9F5]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1E2620]">
                      {comment.name || (comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : "Guest Reader")}
                    </span>
                    {isHidden && (
                      <span className="border border-amber-400 bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-800" style={monoFont}>
                        Hidden
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[9px] text-[#8B9188]" style={monoFont}>
                    <Clock size={9} />
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed ${isHidden ? "text-amber-900/70 italic" : "text-[#3A4239]"}`}>
                  {comment.content}
                </p>

                {canModerate && (
                  <div className="flex items-center justify-end gap-3 border-t border-[#EDEAE0] pt-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleHide(comment._id, comment.isVisible)}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-colors ${
                        isHidden ? "text-emerald-700 hover:text-emerald-900" : "text-amber-700 hover:text-amber-900"
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : isHidden ? (
                        <>
                          <Eye size={11} /> Unhide
                        </>
                      ) : (
                        <>
                          <EyeOff size={11} /> Hide
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDeleteComment(comment._id)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-rose-600 hover:text-rose-800 cursor-pointer transition-colors"
                    >
                      {isBusy ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}