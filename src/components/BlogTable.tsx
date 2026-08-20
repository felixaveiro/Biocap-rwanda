'use client';

import { useState, useEffect } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { BlogPost, User, Role } from "@/types";
import { blogsApi, editorApi } from "@/lib/api/blogs";
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

// ── Type system ───────────────────────────────────────────────
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
  openStoryId?: string | null;
  onViewStory?: (story: BlogPost) => void;
  onEditStory?: (story: BlogPost) => void;
}

export default function BlogTable({
  blogs,
  user,
  showTrash = false,
  onPublish,
  onUnpublish,
  onDelete,
  onRestore,
  onPermanentDelete,
  onRefreshNeeded,
  openStoryId = null,
  onViewStory,
  onEditStory,
}: BlogTableProps) {
  const [editingStory, setEditingStory] = useState<BlogPost | null>(null);
  const [reviewingStory, setReviewingStory] = useState<BlogPost | null>(null);

  // If parent requests opening a specific story, set editingStory when available
  useEffect(() => {
    if (!openStoryId) return;
    const match = blogs.find((b) => b._id === openStoryId);
    if (match) setEditingStory(match);
  }, [openStoryId, blogs]);

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Normalize user.role whether it's a string or an array
  const userRoleStr = Array.isArray(user.role) ? user.role[0] : user.role;
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];

  const isCreator = userRoles.some(
    (r) =>
      r.includes("creator") ||
      r.includes("contributor") ||
      r.includes("principal_investigator") ||
      r.includes("correspondent")
  );
  const isEditor = userRoles.some((r) => r === "editor" || r === "admin");
  const canPublish = userRoles.some(
    (r) => r === "communication_officer" || r === "admin" || r === "editor"
  );

  // Creator Action: Submit Draft for Review
  const handleSubmitForReview = async (storyId: string) => {
    setActiveActionId(storyId);
    setActionError(null);
    try {
      await blogsApi.submitBlog(storyId, userRoleStr as Role);
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      console.error("Failed to submit story:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit story.";
      setActionError(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  // Editor Action: Unpublish Article
  const handleUnpublishStory = async (storyId: string) => {
    if (!window.confirm("Are you sure you want to return this article to review status?")) return;

    setActiveActionId(storyId);
    setActionError(null);
    try {
      if (onUnpublish) {
        await onUnpublish(storyId);
      } else {
        await editorApi.unpublishBlog(storyId, { note: "Unpublished by Editor from Catalog" });
      }
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      console.error("Failed to unpublish story:", err);
      const msg = err instanceof Error ? err.message : "Failed to unpublish story.";
      setActionError(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  // Delete Action (Soft Delete)
  const handleDeleteStory = async (storyId: string, title: string) => {
    if (onDelete) {
      onDelete(storyId);
      return;
    }

    if (!window.confirm(`Are you sure you want to move "${title}" to Trash?`)) return;

    setActiveActionId(storyId);
    setActionError(null);
    try {
      await blogsApi.deleteBlog(storyId, userRoleStr as Role);
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: unknown) {
      console.error("Failed to delete story:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete story.";
      setActionError(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleOpenViewModal = (story: BlogPost) => {
    if (onViewStory) {
      onViewStory(story);
    } else {
      setReviewingStory(story);
    }
  };

  const handleOpenEditModal = (story: BlogPost) => {
    if (onEditStory) {
      onEditStory(story);
    } else {
      setEditingStory(story);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "published":
        return "border-[#3F6B4F] bg-[#3F6B4F]/10 text-[#2C4B38]";
      case "approved":
        return "border-[#A9812F] bg-[#A9812F]/10 text-[#7A5D22]";
      case "pending_review":
      case "submitted":
        return "border-[#A9812F]/60 bg-transparent text-[#A9812F]";
      case "rejected":
        return "border-[#B65C4B] bg-[#B65C4B]/10 text-[#8B4136]";
      default:
        return "border-[#D9D4C6] bg-[#F3F2ED] text-[#5A6259]";
    }
  };

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  const btnBase =
    "inline-flex items-center gap-1 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
  const btnNeutral = `${btnBase} border-[#D9D4C6] bg-white text-[#3A4239] hover:border-[#1E2620] hover:text-[#1E2620]`;
  const btnMoss = `${btnBase} border-[#3F6B4F]/40 bg-[#3F6B4F]/10 text-[#2C4B38] hover:bg-[#3F6B4F] hover:text-white hover:border-[#3F6B4F]`;
  const btnGold = `${btnBase} border-[#A9812F]/40 bg-[#A9812F]/10 text-[#7A5D22] hover:bg-[#A9812F] hover:text-white hover:border-[#A9812F]`;
  const btnClay = `${btnBase} border-[#B65C4B]/40 bg-[#B65C4B]/10 text-[#8B4136] hover:bg-[#B65C4B] hover:text-white hover:border-[#B65C4B]`;
  const iconBtn =
    "border p-1.5 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";

  return (
    <div className={`${fontVars} w-full border border-[#E2DDCF] bg-white`} style={bodyFont}>
      {actionError && (
        <div className="m-4 flex items-center gap-2 border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-3 text-xs font-medium text-[#8B4136]">
          <AlertTriangle size={15} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#3A4239]">
          <thead className="border-b border-[#E2DDCF] bg-[#FAF9F5] text-[10px] font-semibold uppercase tracking-wider text-[#8B9188]" style={monoFont}>
            <tr>
              <th scope="col" className="px-6 py-3.5">Title &amp; Excerpt</th>
              <th scope="col" className="px-6 py-3.5">Category Tag</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEAE0]">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <p className="text-[13px] italic text-[#B4B0A2]" style={displayFont}>
                    {showTrash ? "The trash bin is empty." : "No articles found in this catalog."}
                  </p>
                </td>
              </tr>
            ) : (
              blogs.map((story) => {
                const isBusy = activeActionId === story._id;
                const statusStyle = getStatusStyle(story.status);
                const accentColor = statusStyle.match(/border-\[(#[0-9A-Fa-f]{6})\]/)?.[1] ?? "#D9D4C6";

                return (
                  <tr
                    key={story._id}
                    className="transition-colors hover:bg-[#FAF9F5]"
                    style={{ boxShadow: `inset 3px 0 0 ${accentColor}` }}
                  >
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-semibold text-[#1E2620]">{story.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs italic text-[#8B9188]" style={displayFont}>
                        {story.excerpt || "No excerpt provided."}
                      </p>

                      {/* Display Editor Revision Note if Rejected */}
                      {story.status === "rejected" && story.lastRejectionNote && (
                        <div className="mt-2 inline-flex items-center gap-1.5 border border-[#A9812F]/30 bg-[#A9812F]/10 px-2.5 py-1 text-[11px] font-medium text-[#7A5D22]">
                          <MessageSquare size={12} className="shrink-0" />
                          <span className="truncate max-w-xs">
                            Feedback: {story.lastRejectionNote}
                          </span>
                        </div>
                      )}

                      {story.changeRequests && story.changeRequests.filter((c) => !c.implemented).length > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1.5 border border-[#B65C4B]/30 bg-[#B65C4B]/10 px-2.5 py-1 text-[11px] font-medium text-[#8B4136]">
                          <MessageSquare size={12} className="shrink-0" />
                          <span className="truncate max-w-xs">Changes requested: {story.changeRequests.filter((c) => !c.implemented).length}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className="border border-[#D9D4C6] bg-[#F3F2ED] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5A6259]"
                        style={monoFont}
                      >
                        {story.tag || (story as any).category || "General"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}
                        style={monoFont}
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
                                className={btnMoss}
                                title="Restore Article"
                              >
                                <RotateCcw size={13} />
                                Restore
                              </button>
                            )}

                            {onPermanentDelete && (
                              <button
                                onClick={() => onPermanentDelete(story._id)}
                                className={btnClay}
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
                                {/* EYE BUTTON: Triggers ReviewStoryModal */}
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleOpenViewModal(story)}
                                  className={`${iconBtn} border-[#D9D4C6] text-[#5A6259] hover:border-[#1E2620] hover:text-[#1E2620]`}
                                  title="View Full Story"
                                >
                                  <Eye size={15} />
                                </button>

                                {(story.status === "draft" || story.status === "rejected") && (
                                  <button
                                    disabled={isBusy}
                                    onClick={() => handleSubmitForReview(story._id)}
                                    className={btnGold}
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
                                  onClick={() => handleOpenEditModal(story)}
                                  className={`${iconBtn} border-[#D9D4C6] text-[#5A6259] hover:border-[#1E2620] hover:text-[#1E2620]`}
                                  title="Edit Story"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  disabled={isBusy}
                                  onClick={() => handleDeleteStory(story._id, story.title)}
                                  className={`${iconBtn} border-[#B65C4B]/30 text-[#B65C4B] hover:border-[#B65C4B] hover:bg-[#B65C4B] hover:text-white`}
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

                            {/* EDITOR ACTIONS */}
                            {isEditor && (
                              <>
                                <button
                                  onClick={() => handleOpenViewModal(story)}
                                  className={btnNeutral}
                                  title="Review Submission Workspace"
                                >
                                  <Eye size={13} /> Review
                                </button>

                                {story.status === "published" && (
                                  <button
                                    disabled={isBusy}
                                    onClick={() => handleUnpublishStory(story._id)}
                                    className={btnClay}
                                    title="Unpublish Article"
                                  >
                                    <XCircle size={13} /> Unpublish
                                  </button>
                                )}

                                <button
                                  disabled={isBusy}
                                  onClick={() => handleDeleteStory(story._id, story.title)}
                                  className={`${iconBtn} border-[#B65C4B]/30 text-[#B65C4B] hover:border-[#B65C4B] hover:bg-[#B65C4B] hover:text-white`}
                                  title="Move Story to Trash"
                                >
                                  {isBusy ? (
                                    <Loader2 size={15} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                </button>
                              </>
                            )}

                            {/* PUBLISHER ACTIONS */}
                            {canPublish && story.status === "approved" && onPublish && (
                              <button
                                onClick={() => onPublish(story)}
                                className={btnMoss}
                              >
                                <CheckCircle2 size={13} /> Publish
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
          currentUserRole={userRoleStr as Role}
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
          currentUserRole={userRoleStr as Role}
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