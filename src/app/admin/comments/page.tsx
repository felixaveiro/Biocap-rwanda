'use client';

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { blogsApi } from "@/lib/api/blogs";
import { BlogPost, Comment } from "@/types";
import { MessageSquare, Eye, EyeOff, Trash2, Loader2, RefreshCw } from "lucide-react";

export default function CommentModerationPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const loadBlogsWithComments = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch articles and filter those containing public comments
      const res = await blogsApi.getBlogs(undefined, { limit: 50 });
      const blogList = Array.isArray(res) ? res : (res as any).docs || (res as any).data || [];
      
      // Keep only stories that have comments
      const filtered = blogList.filter((b: BlogPost) => Array.isArray(b.comments) && b.comments.length > 0);
      setBlogs(filtered);
    } catch (err) {
      console.error("Failed to load blog comments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogsWithComments();
  }, [loadBlogsWithComments]);

  // Hide or Unhide Comment Toggle
  const handleToggleHide = async (blogId: string, commentId: string, isVisible?: boolean) => {
    setActiveActionId(commentId);
    try {
      if (isVisible === false) {
        await blogsApi.unhideBlogComment(blogId, commentId);
      } else {
        await blogsApi.hideBlogComment(blogId, commentId);
      }
      await loadBlogsWithComments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update comment visibility.";
      alert(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  // Delete Comment Action
  const handleDelete = async (blogId: string, commentId: string) => {
    if (!confirm("Are you sure you want to permanently remove this comment?")) return;
    setActiveActionId(commentId);
    try {
      await blogsApi.deleteBlogComment(blogId, commentId);
      await loadBlogsWithComments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete comment.";
      alert(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#FAF9F5] font-sans text-[#1E2620]">
      <div>
        <Header
          title="Comment Moderation Center"
          subtitle="Review, hide, or remove user discussion and public comments across all articles"
        />

        <main className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          {/* Header Action Bar */}
          <div className="mb-6 flex items-center justify-between border-b border-[#E2DDCF] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[#3F6B4F]" />
                <h1 className="text-xl font-semibold text-[#1E2620]">Active Discussion Queue</h1>
              </div>
              <p className="mt-1 text-xs text-[#8B9188]">
                Moderate public responses and maintain discussion guidelines.
              </p>
            </div>
            <button
              type="button"
              onClick={loadBlogsWithComments}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-[#D9D4C6] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3A4239] transition hover:border-[#1E2620]"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {/* Main Comment List */}
          {loading ? (
            <div className="flex h-64 items-center justify-center text-xs text-[#8B9188]">
              <Loader2 size={18} className="mr-2 animate-spin text-[#3F6B4F]" /> Loading comment queue...
            </div>
          ) : blogs.length === 0 ? (
            <div className="border border-dashed border-[#D9D4C6] bg-white p-12 text-center text-xs italic text-[#8B9188]">
              No active public comments require moderation.
            </div>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div key={blog._id} className="border border-[#E2DDCF] bg-white p-5 shadow-xs">
                  <div className="mb-4 flex items-center justify-between border-b border-[#EDEAE0] pb-3">
                    <h3 className="text-sm font-semibold text-[#1E2620]">{blog.title}</h3>
                    <span className="border border-[#D9D4C6] bg-[#FAF9F5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#5A6259]">
                      {blog.comments?.length || 0} Comments
                    </span>
                  </div>

                  <div className="space-y-3">
                    {blog.comments?.map((comment: Comment) => {
                      const isHidden = comment.isVisible === false;
                      const isBusy = activeActionId === comment._id;

                      return (
                        <div
                          key={comment._id}
                          className={`flex flex-col justify-between gap-4 border p-4 sm:flex-row sm:items-center ${
                            isHidden ? "border-amber-300 bg-amber-50/50" : "border-[#EDEAE0] bg-[#FAF9F5]"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-[#1E2620]">
                                {comment.name || (comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : "Guest Author")}
                              </span>
                              {comment.email && (
                                <span className="text-[10px] text-[#8B9188]">({comment.email})</span>
                              )}
                              {isHidden && (
                                <span className="border border-amber-400 bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-800">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className={`text-xs ${isHidden ? "italic text-amber-900/80" : "text-[#3A4239]"}`}>
                              {comment.content}
                            </p>
                          </div>

                          {/* Moderation Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleHide(blog._id, comment._id, comment.isVisible)}
                              className={`inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${
                                isHidden
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                  : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              }`}
                            >
                              {isBusy ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : isHidden ? (
                                <>
                                  <Eye size={12} /> Unhide
                                </>
                              ) : (
                                <>
                                  <EyeOff size={12} /> Hide
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDelete(blog._id, comment._id)}
                              className="inline-flex cursor-pointer items-center gap-1.5 border border-rose-300 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-800 transition hover:bg-rose-100"
                            >
                              {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      
    </div>
  );
}