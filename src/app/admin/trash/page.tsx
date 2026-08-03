'use client';

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { blogsApi } from "@/lib/api/blogs";
import { BlogPost, Role } from "@/types";
import { useSession } from "@/hooks/useSession";
import { RotateCcw, Trash2, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminTrashPage() {
  const { user } = useSession("blog:view");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDeleted = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await blogsApi.getDeletedBlogs(user?.role as Role);

      let list: BlogPost[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res && Array.isArray(res.data)) {
        list = res.data;
      }

      setBlogs(list);
    } catch (err: unknown) {
      console.error("Failed to load trash bin:", err);
      const msg = err instanceof Error ? err.message : "Failed to load deleted stories.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeleted();
    }
  }, [user]);

  const handleRestore = async (id: string) => {
    try {
      await blogsApi.restoreBlog(id, user?.role as Role);
      await fetchDeleted();
    } catch (err) {
      console.error("Failed to restore blog:", err);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (
      !confirm(
        "CRITICAL WARNING: This will permanently delete the story and wipe its Cloudinary media assets. Proceed?"
      )
    )
      return;

    try {
      await blogsApi.permanentDeleteBlog(id, user?.role as Role);
      await fetchDeleted();
    } catch (err) {
      console.error("Failed to hard delete blog:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Trash Bin"
        subtitle="Restore soft-deleted articles or wipe them permanently from Cloudinary"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-xs">
          <AlertTriangle size={20} className="shrink-0 text-amber-600" />
          <p className="text-sm font-medium">
            Items in the trash bin can be restored at any time. Permanent deletion removes the article
            and destroys associated media assets on Cloudinary forever.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="text-sm font-medium">{errorMsg}</p>
            <button
              onClick={fetchDeleted}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Deleted Story</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    Loading trash bin...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    Trash bin is empty.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {blog.img && (
                          <img
                            src={blog.img}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{blog.title}</p>
                          <span className="text-xs font-medium text-indigo-600">{blog.tag}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {blog.originalAuthor
                        ? `${blog.originalAuthor.firstName} ${blog.originalAuthor.lastName}`
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(blog._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(blog._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                        >
                          <Trash2 size={14} /> Delete Permanently
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}