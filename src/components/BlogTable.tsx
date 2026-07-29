"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { canDeleteBlog, canEditBlog } from "@/lib/permissions";
import { deleteBlog } from "@/lib/api/blogs";
import { BlogPost, ROLE_LABELS, User, Role } from "@/types";

export default function BlogTable({
  blogs,
  user,
}: {
  blogs: BlogPost[];
  user: User;
}) {
  const [rows, setRows] = useState<BlogPost[]>(blogs);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        No stories yet. Create the first draft to begin the workflow.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
            // Pass `post` directly — no inline `{ ...post, authorId }` object
            const editable = canEditBlog(user.role as Role, user._id, post);
            const deletable = canDeleteBlog(user.role as Role, user._id, post);

            // Safely resolve author details for table display
            const authorObj = typeof post.author === "object" ? post.author : null;
            const authorName = authorObj
              ? `${authorObj.firstName || ""} ${authorObj.lastName || ""}`.trim() || authorObj.username
              : "Author";

            const authorRole = authorObj?.role || post.originalAuthorRole || "user";

            return (
              <tr key={post._id} className="hover:bg-slate-50/60">
                <td className="max-w-xs px-5 py-3">
                  <Link href={`/dashboard/blog/edit/${post._id}`} className="block">
                    <p className="truncate font-semibold text-slate-900 hover:text-[#E52B67]">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
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
                <td className="px-5 py-3 text-slate-500">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/dashboard/blog/edit/${post._id}`}
                      className="text-[#E52B67] hover:underline font-medium"
                    >
                      {editable ? "Edit" : "View"}
                    </Link>
                    {deletable && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={busyId === post._id}
                        className="text-rose-600 hover:underline disabled:opacity-50 font-medium"
                      >
                        {busyId === post._id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}