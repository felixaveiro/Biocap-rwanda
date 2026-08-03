'use client';

import { useState } from "react";
import { BlogPost, User, Role } from "@/types";
import { blogsApi } from "@/lib/api/blogs";
import EditStoryModal from "@/components/EditStoryModal";
import ReviewStoryModal from "@/components/ReviewStoryModal";
import {
  Edit3,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Trash2,
  Loader2,
  AlertTriangle,
  MessageSquare,
  RotateCcw,
} from "lucide-react";

interface BlogTableProps {
  blogs: BlogPost[];
  user: User;
  showTrash?: boolean;
  onPublish?: (target: BlogPost | string) => void;
  onUnpublish?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, note?: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onRefreshNeeded?: () => void;
}

export default function BlogTable({
  blogs,
  user,
  showTrash = false,
  onPublish,
  onUnpublish,
  onApprove,
  onReject,
  onDelete,
  onRestore,
  onPermanentDelete,
  onRefreshNeeded,
}: BlogTableProps) {
  const [editingStory, setEditingStory] = useState<BlogPost | null>(null);
  const [reviewingStory, setReviewingStory] = useState<BlogPost | null>(null);

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCreator = user.role.includes("creator");
  const isEditor = user.role === "editor" || user.role === "admin";
  const isOfficer = user.role === "communication_officer" || user.role === "admin";

  // Creator Action: Submit Draft for Review
  const handleSubmitForReview = async (storyId: string) => {
    setActiveActionId(storyId);
    setActionError(null);
    try {
      await blogsApi.submitBlog(storyId, user.role as Role);
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      console.error("Failed to submit story:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit story.";
      setActionError(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  // Creator Action: Delete Story Draft (Soft Delete)
  const handleDeleteStory = async (storyId: string, title: string) => {
    if (onDelete) {
      onDelete(storyId);
      return;
    }

    if (!window.confirm(`Are you sure you want to move "${title}" to Trash?`)) return;

    setActiveActionId(storyId);
    setActionError(null);
    try {
      await blogsApi.deleteBlog(storyId, user.role as Role);
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      console.error("Failed to delete story:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete story.";
      setActionError(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "approved":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "pending_review":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200/80";
    }
  };

  return (
    <div className="w-full">
      {actionError && (
        <div className="m-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          <AlertTriangle size={15} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200/80 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-4">Title & Excerpt</th>
              <th scope="col" className="px-6 py-4">Category Tag</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                  {showTrash ? "Trash bin is currently empty." : "No articles found in this catalog."}
                </td>
              </tr>
            ) : (
              blogs.map((story) => {
                const isBusy = activeActionId === story._id;

                return (
                  <tr key={story._id} className="transition hover:bg-slate-50/50">
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-semibold text-slate-900">{story.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {story.excerpt || "No excerpt provided."}
                      </p>

                      {/* Display Editor Revision Note if Rejected */}
                      {story.status === "rejected" && story.lastRejectionNote && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 border border-amber-200/60">
                          <MessageSquare size={12} className="shrink-0 text-amber-600" />
                          <span className="truncate max-w-xs">
                            Feedback: {story.lastRejectionNote}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {story.tag || "General"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(
                          story.status
                        )}`}
                      >
                        {story.status?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* TRASH BIN ACTIONS */}
                        {showTrash ? (
                          <>
                            {onRestore && (
                              <button
                                onClick={() => onRestore(story._id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                                title="Restore Article"
                              >
                                <RotateCcw size={13} />
                                Restore
                              </button>
                            )}

                            {onPermanentDelete && (
                              <button
                                onClick={() => onPermanentDelete(story._id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                                title="Permanently Delete Article"
                              >
                                <Trash2 size={13} />
                                Wipe
                              </button>
                            )}
                          </>
                        ) : (
                          /* STANDARD WORKFLOW ACTIONS */
                          <>
                            {/* CREATOR ACTIONS */}
                            {isCreator && (
                              <>
                                {(story.status === "draft" || story.status === "rejected") && (
                                  <button
                                    disabled={isBusy}
                                    onClick={() => handleSubmitForReview(story._id)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50"
                                    title="Submit Draft for Editorial Review"
                                  >
                                    {isBusy ? (
                                      <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                      <Send size={13} />
                                    )}
                                    Submit
                                  </button>
                                )}

                                <button
                                  disabled={isBusy}
                                  onClick={() => setEditingStory(story)}
                                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition disabled:opacity-50"
                                  title="Edit Story"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  disabled={isBusy}
                                  onClick={() => handleDeleteStory(story._id, story.title)}
                                  className="rounded-lg border border-rose-100 p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition disabled:opacity-50"
                                  title="Delete Story Draft"
                                >
                                  {isBusy ? (
                                    <Loader2 size={15} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>
                              </>
                            )}

                            {/* EDITOR ACTION */}
                            {isEditor && (
                              <button
                                onClick={() => setReviewingStory(story)}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                                title="Review Submission"
                              >
                                <Eye size={15} />
                              </button>
                            )}

                            {/* OFFICER & ADMIN PUBLISH ACTIONS */}
                            {isOfficer && story.status === "approved" && onPublish && (
                              <button
                                onClick={() => onPublish(story)}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1"
                              >
                                <CheckCircle2 size={13} /> Publish
                              </button>
                            )}

                            {isOfficer && story.status === "published" && (onUnpublish || onPublish) && (
                              <button
                                onClick={() => (onUnpublish ? onUnpublish(story._id) : onPublish!(story))}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition flex items-center gap-1"
                              >
                                <XCircle size={13} /> Unpublish
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* RENDER EDIT STORY MODAL */}
      {editingStory && (
        <EditStoryModal
          story={editingStory}
          currentUserRole={user.role}
          onClose={() => setEditingStory(null)}
          onStoryUpdated={() => {
            setEditingStory(null);
            if (onRefreshNeeded) onRefreshNeeded();
          }}
        />
      )}

      {/* RENDER REVIEW STORY MODAL */}
      {reviewingStory && (
        <ReviewStoryModal
          story={reviewingStory}
          currentUserRole={user.role}
          onClose={() => setReviewingStory(null)}
          onReviewCompleted={() => {
            setReviewingStory(null);
            if (onRefreshNeeded) onRefreshNeeded();
          }}
        />
      )}
    </div>
  );
}