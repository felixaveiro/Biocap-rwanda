'use client';

import React from 'react';
import { Comment } from '@/types';
import { MessageSquare, Reply, Send, Loader2 } from 'lucide-react';

interface ArticleCommentSectionProps {
  comments: Comment[];
  commentForm: { name: string; email: string; phone: string; content: string };
  setCommentForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; content: string }>>;
  replyCommentId: string | null;
  setReplyCommentId: (id: string | null) => void;
  commentSubmitting: boolean;
  commentError: string | null;
  commentSuccess: string | null;
  handleCommentSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function ArticleCommentSection({
  comments,
  commentForm,
  setCommentForm,
  replyCommentId,
  setReplyCommentId,
  commentSubmitting,
  commentError,
  commentSuccess,
  handleCommentSubmit,
}: ArticleCommentSectionProps) {
  const getCommentAuthorName = (comment: Comment) => {
    if (comment.user && comment.user.firstName) {
      return `${comment.user.firstName} ${comment.user.lastName || ''}`.trim();
    }
    return comment.name || 'Guest';
  };

  const replyTargetComment = comments.find((comment) => comment._id === replyCommentId) || null;

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

        <p className="mt-3 text-sm leading-7 text-slate-700">{comment.content}</p>

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

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#1B3A5C]">
          <MessageSquare size={16} />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <span className="rounded-full bg-[#1B3A5C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          {comments.length}
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
        {comments.length > 0 ? (
          comments.filter((comment) => !comment.parentComment).map((comment) => renderCommentTree(comment))
        ) : (
          <p className="text-sm text-slate-500">No public comments yet. Be the first to share your thoughts.</p>
        )}
      </div>
    </div>
  );
}