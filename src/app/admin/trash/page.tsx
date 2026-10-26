'use client';

import { useCallback, useEffect, useState } from "react";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import { blogsApi } from "@/lib/api/blogs";
import { BlogPost, Role } from "@/types";
import { useSession } from "@/hooks/useSession";
import {
  RotateCcw,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Archive,
  Loader2,
  Tag,
} from "lucide-react";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

export default function AdminTrashPage() {
  const { user } = useSession("blog:view");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDeleted = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDeleted();
    }
  }, [user, fetchDeleted]);

  const handleRestore = async (id: string) => {
    setActiveActionId(id);
    setActionError(null);
    try {
      await blogsApi.restoreBlog(id, user?.role as Role);
      await fetchDeleted();
    } catch (err) {
      console.error("Failed to restore blog:", err);
      setActionError("Couldn't restore that story. Try again.");
    } finally {
      setActiveActionId(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (
      !confirm(
        "This permanently deletes the story and wipes its Cloudinary media assets. This can't be undone. Proceed?"
      )
    )
      return;

    setActiveActionId(id);
    setActionError(null);
    try {
      await blogsApi.permanentDeleteBlog(id, user?.role as Role);
      await fetchDeleted();
    } catch (err) {
      console.error("Failed to hard delete blog:", err);
      setActionError("Couldn't wipe that story. Try again.");
    } finally {
      setActiveActionId(null);
    }
  };

  const fontVars = `${fraunces.variable} ${plexMono.variable}`;
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  const rowBtnBase =
    "inline-flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-40 disabled:pointer-events-none";
  const btnMoss = `${rowBtnBase} border-[#3F6B4F] bg-transparent text-[#3F6B4F] hover:bg-[#3F6B4F] hover:text-[#FAF9F5]`;
  const btnClay = `${rowBtnBase} border-[#8B4136]/40 bg-[#8B4136]/5 text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5] hover:border-[#8B4136]`;

  const getInitials = (first?: string, last?: string) => {
    const a = first?.[0] ?? "";
    const b = last?.[0] ?? "";
    const initials = `${a}${b}`.toUpperCase();
    return initials || "—";
  };

  return (
    <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]`}>
      <Header
        title="Trash Archive"
        subtitle="Restore soft-deleted articles or wipe them permanently from Cloudinary media storage"
      />

      <main className="mx-auto max-w-7xl px-8 py-8">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-20 rounded-none bg-[#EFECE6]" />
            <div className="h-96 w-full rounded-none bg-[#EFECE6]" />
          </div>
        ) : (
          <>
            {/* ─── Metric & Policy Strip ────────────────────────────────────── */}
            <div className="mb-8 grid gap-5 sm:grid-cols-[240px,1fr]">
              <div className="border-t-2 border-[#8B4136] border-b border-x border-[#E2DDCF] bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A9812F]"
                    style={monoFont}
                  >
                    Trash Volume
                  </span>
                  <Archive size={16} className="text-[#8B4136]" />
                </div>
                <p className="mt-3 text-3xl font-serif italic text-[#1E2620]" style={displayFont}>
                  {blogs.length}
                </p>
              </div>

              <div className="flex items-center gap-3 border-l-2 border-[#A9812F] border-y border-r border-[#E2DDCF] bg-[#FAF9F5] p-5">
                <AlertTriangle size={18} className="shrink-0 text-[#A9812F]" />
                <p className="text-xs leading-relaxed text-[#5A6259]">
                  Articles in this bin remain recoverable until wiped. Performing a{" "}
                  <strong className="font-semibold text-[#8B4136]">Permanent Wipe</strong> removes the record
                  from the catalog and purges all linked media from Cloudinary servers permanently.
                </p>
              </div>
            </div>

            {/* ─── Error States ────────────────────────────────────────────── */}
            {errorMsg && (
              <div className="mb-6 flex items-center justify-between border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} />
                  <p className="text-xs font-medium">{errorMsg}</p>
                </div>
                <button
                  onClick={fetchDeleted}
                  className="inline-flex items-center gap-1.5 border border-[#8B4136]/30 bg-[#FAF9F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5]"
                  style={monoFont}
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            {actionError && (
              <div className="mb-6 flex items-center gap-3 border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
                <AlertTriangle size={16} />
                <p className="text-xs font-medium">{actionError}</p>
              </div>
            )}

            {/* ─── Table ─────────────────────────────────────────────────────── */}
            <div className="border border-[#E2DDCF] bg-[#FAF9F5]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1E2620]">
                  <thead
                    className="border-b border-[#D9D4C6] bg-[#EFECE6]/50 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8079]"
                    style={monoFont}
                  >
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Archived Story</th>
                      <th scope="col" className="px-6 py-3.5">Original Author</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DDCF]">
                    {blogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center">
                          <Archive size={24} className="mx-auto mb-3 text-[#A9812F]/50" />
                          <p className="text-base italic text-[#5A6259]" style={displayFont}>
                            The trash bin is currently empty.
                          </p>
                          <p className="mt-1 text-xs text-[#7A8079]">
                            Soft-deleted articles will appear here for restoration or final purge.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      blogs.map((blog) => {
                        const isBusy = activeActionId === blog._id;
                        return (
                          <tr
                            key={blog._id}
                            className="transition-colors hover:bg-[#EFECE6]/40"
                          >
                            <td className="px-6 py-4 max-w-md">
                              <div className="flex items-center gap-3.5">
                                {blog.img ? (
                                  <img
                                    src={blog.img}
                                    alt=""
                                    className="h-10 w-12 shrink-0 border border-[#E2DDCF] object-cover grayscale opacity-80"
                                  />
                                ) : (
                                  <div
                                    className="flex h-10 w-12 shrink-0 items-center justify-center border border-[#E2DDCF] bg-[#EFECE6] text-[10px] font-semibold text-[#7A8079]"
                                    style={monoFont}
                                  >
                                    {getInitials(blog.title?.[0], "")}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-[#1E2620]">{blog.title}</p>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#A9812F]" style={monoFont}>
                                    <Tag size={10} /> {blog.tag || "General"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#D9D4C6] bg-[#EFECE6] text-[9px] font-semibold text-[#5A6259]"
                                  style={monoFont}
                                >
                                  {getInitials(blog.originalAuthor?.firstName, blog.originalAuthor?.lastName)}
                                </div>
                                <span className="text-xs text-[#5A6259]">
                                  {blog.originalAuthor
                                    ? `${blog.originalAuthor.firstName} ${blog.originalAuthor.lastName}`
                                    : "Contributor"}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleRestore(blog._id)}
                                  className={btnMoss}
                                  style={monoFont}
                                  title="Restore Article"
                                >
                                  {isBusy ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <RotateCcw size={12} />
                                  )}
                                  Restore
                                </button>
                                <button
                                  disabled={isBusy}
                                  onClick={() => handlePermanentDelete(blog._id)}
                                  className={btnClay}
                                  style={monoFont}
                                  title="Permanently Delete Article"
                                >
                                  {isBusy ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={12} />
                                  )}
                                  Wipe
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}