"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { canDeleteBlog, canEditBlog, can } from "@/lib/permissions";
import { deleteBlog } from "@/lib/api/blogs";
import { BlogPost, ROLE_LABELS, User, Role } from "@/types";
import {
  CheckCircle,
  XCircle,
  Globe,
  Trash2,
  Edit,
  Eye,
  Loader2,
} from "lucide-react";

interface BlogTableProps {
  blogs: BlogPost[];
  user: User;
  onPublish?: (id: string) => void;
  onReject?: (id: string, note?: string) => void;
  onApprove?: (id: string) => void;
}

export default function BlogTable({
  blogs,
  user,
  onPublish,
  onReject,
  onApprove,
}: BlogTableProps) {
  const [rows, setRows] = useState<BlogPost[]>(blogs);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rejection note state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    setRows(blogs);
  }, [blogs]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteBlog(id, user.role as Role);
      setRows((prev) => prev.filter((b) => b._id !== id));
    } catch {
      setError("Failed to delete post");
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmReject() {
    if (!rejectingId) return;
    setBusyId(rejectingId);
    try {
      if (onReject) {
        await onReject(rejectingId, rejectNote);
      }
      setRejectingId(null);
      setRejectNote("");
    } catch {
      setError("Failed to reject post");
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-xs">
        No stories found.
      </div>
    );
  }

  const userRole = user.role as Role;
  const canApprove = can(userRole, "blog:approve");
  const canPublish = can(userRole, "blog:publish");

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Story</th>
            <th className="px-5 py-3 font-medium">Creator</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Updated</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((post) => {
            const editable = canEditBlog(userRole, user._id, post);
            const deletable = canDeleteBlog(userRole, user._id, post);

            // Resolve author details
            const authorObj = typeof post.author === "object" ? post.author : null;
            const authorName = authorObj
              ? `${authorObj.firstName || ""} ${authorObj.lastName || ""}`.trim() || authorObj.username
              : "Author";

            const authorRole = authorObj?.role || post.originalAuthorRole || "user";
            const postStatus = post.status as string;

            return (
              <tr key={post._id} className="hover:bg-slate-50/60 transition">
                <td className="max-w-xs px-5 py-3">
                  <Link href={`/dashboard/blog/edit/${post._id}`} className="block">
                    <p className="truncate font-semibold text-slate-900 hover:text-indigo-600 transition">
                      {post.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {post.tag || "General"}
                    </p>
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  <div className="font-medium text-slate-800">{authorName}</div>
                  <div className="text-xs text-slate-500">
                    {ROLE_LABELS[authorRole as keyof typeof ROLE_LABELS] || "Creator"}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Workflow Editorial Actions */}
                    {canApprove && (postStatus === "submitted" || postStatus === "pending") && (
                      <>
                        <button
                          onClick={() => onApprove && onApprove(post._id)}
                          disabled={busyId === post._id}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                          title="Approve post"
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(post._id)}
                          disabled={busyId === post._id}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                          title="Reject post"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </>
                    )}

                    {canPublish && (postStatus === "approved" || postStatus === "submitted") && (
                      <button
                        onClick={() => onPublish && onPublish(post._id)}
                        disabled={busyId === post._id}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        title="Publish to public site"
                      >
                        <Globe size={13} />
                        Publish
                      </button>
                    )}

                    {/* Standard Edit/View Button */}
                    <Link
                      href={`/dashboard/blog/edit/${post._id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 transition ml-1"
                    >
                      {editable ? (
                        <>
                          <Edit size={13} /> Edit
                        </>
                      ) : (
                        <>
                          <Eye size={13} /> View
                        </>
                      )}
                    </Link>

                    {/* Delete Button */}
                    {deletable && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={busyId === post._id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800 transition"
                      >
                        {busyId === post._id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Request Revisions</h3>
            <p className="mt-1 text-xs text-slate-500">
              Provide feedback to the author on why this post requires changes.
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Please update images and adjust the title..."
              className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={busyId === rejectingId}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Reject & Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}