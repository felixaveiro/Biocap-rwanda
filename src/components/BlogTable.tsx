"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { canDeleteBlog, canEditBlog } from "@/lib/permissions";
import { deleteBlog } from "@/lib/data";
import { BlogPost, SessionUser } from "@/types";

export default function BlogTable({
  blogs,
  user,
}: {
  blogs: BlogPost[];
  user: SessionUser;
}) {
  const [rows, setRows] = useState<BlogPost[]>(blogs);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep local rows in sync if the parent passes a fresh blogs array
  // (e.g. after it re-fetches from localStorage)
  useEffect(() => {
    setRows(blogs);
  }, [blogs]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteBlog(id);
      setRows((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setError("Failed to delete post");
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Author</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Updated</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((post) => {
            const editable = canEditBlog(user.role, user.id, post);
            const deletable = canDeleteBlog(user.role, user.id, post);
            return (
              <tr key={post.id} className="hover:bg-slate-50/60">
                <td className="max-w-xs truncate px-5 py-3 font-medium text-slate-900">
                  <Link href={`/dashboard/blog/${post.id}`} className="hover:text-brand-600">
                    {post.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{post.authorName}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/dashboard/blog/${post.id}`}
                      className="text-brand-600 hover:underline"
                    >
                      {editable ? "Edit" : "View"}
                    </Link>
                    {deletable && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={busyId === post.id}
                        className="text-rose-600 hover:underline disabled:opacity-50"
                      >
                        {busyId === post.id ? "Deleting..." : "Delete"}
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