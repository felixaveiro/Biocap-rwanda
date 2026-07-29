'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import BlogForm from "@/components/BlogForm";
import BlogActions from "@/components/BlogActions";
import { blogsApi } from "@/lib/api/blogs";
import { canEditBlog, canViewBlog } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { BlogPost, ROLE_LABELS, Role } from "@/types";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useSession();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!user || !params.id) return;

    (async () => {
      try {
        const found = await blogsApi.getBlogById(params.id, user.role as Role);

        if (!found || !canViewBlog(user.role as Role, user._id, found)) {
          setDenied(true);
        } else {
          setPost(found);
        }
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
        setDenied(true);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user, params.id]);

  if (loading || !user || dataLoading) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching post" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  if (denied || !post) {
    return (
      <div>
        <Header title="Not found" subtitle="" />
        <div className="p-8 text-sm text-slate-400">
          This post doesn&apos;t exist or you don&apos;t have access to it.{" "}
          <button
            className="text-[#E52B67] underline"
            onClick={() => router.push("/dashboard/blog")}
          >
            Back to blogs
          </button>
        </div>
      </div>
    );
  }

  const userRole = user.role as Role;
  const editable = canEditBlog(userRole, user._id, post);

  // Derive author details cleanly
  const authorObj = typeof post.author === "object" ? post.author : null;
  const authorName = authorObj
    ? `${authorObj.firstName || ""} ${authorObj.lastName || ""}`.trim() || authorObj.username
    : "Author";
  const authorRole = authorObj?.role || post.originalAuthorRole || "user";

  const statusStr = (post.status as string) || "";
  
  // Type-safe history extraction
  const historyList = (post as unknown as { history?: Array<{ id?: string; action: string; by?: string; at: string | Date; note?: string }> }).history || [];

  return (
    <div>
      <Header title={post.title} subtitle={`By ${authorName}`} />
      <div className="grid gap-6 p-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={post.status} />
              {post.tag && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                  #{post.tag}
                </span>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Creator byline
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {authorName}
              </p>
              <p className="text-sm text-slate-600">
                {ROLE_LABELS[authorRole as keyof typeof ROLE_LABELS] || "Creator"}
              </p>
            </div>
          </div>

          {(statusStr === "rejected" || statusStr === "changes_requested") && (post as unknown as { reviewNote?: string }).reviewNote && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Review Note / Rejection Reason</p>
              <p className="mt-1">{(post as unknown as { reviewNote?: string }).reviewNote}</p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            {editable ? (
              <BlogForm
  mode="edit"
  role={userRole}
  creatorName={authorName}
  creatorRole={authorRole as unknown as undefined}
  initial={{
    id: post._id,
    _id: post._id,
    title: post.title,
    content: post.excerpt || "",
    tags: post.tag ? [post.tag] : [],
  } as any}
/>
            ) : (
              <article className="prose prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-700">
                {post.excerpt && (
                  <p className="font-medium text-slate-900 text-base mb-4">
                    {post.excerpt}
                  </p>
                )}
                {post.blocks && post.blocks.length > 0 ? (
                  <div className="space-y-4">
                    {post.blocks.map((block, idx) => {
                      const b = block as unknown as { type: string; content?: string; value?: string; text?: string };
                      const textVal = b.content || b.value || b.text || "";

                      return (
                        <div key={idx}>
                          {b.type === "heading" && (
                            <h2 className="text-lg font-bold text-slate-900">{textVal}</h2>
                          )}
                          {b.type === "text" && <p>{textVal}</p>}
                          {b.type === "quote" && (
                            <blockquote className="border-l-4 border-[#E52B67] pl-4 italic text-slate-600">
                              {textVal}
                            </blockquote>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>No content blocks available.</p>
                )}
              </article>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <BlogActions post={post} user={user} />

          {historyList.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">History</h3>
              <ol className="mt-3 space-y-3">
                {[...historyList].reverse().map((h, idx) => (
                  <li key={h.id || idx} className="text-sm">
                    <p className="font-medium text-slate-800">
                      {historyLabel(h.action)}{" "}
                      {h.by && <span className="font-normal text-slate-400">by {h.by}</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(h.at).toLocaleString()}
                    </p>
                    {h.note && (
                      <p className="mt-1 text-xs text-slate-500">&ldquo;{h.note}&rdquo;</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function historyLabel(action: string) {
  const normAction = action.toUpperCase();
  switch (normAction) {
    case "CREATED":
      return "Created";
    case "SUBMITTED":
      return "Submitted for review";
    case "APPROVED":
      return "Approved";
    case "PUBLISHED":
      return "Published";
    case "REJECTED":
      return "Rejected";
    case "RESUBMITTED":
      return "Resubmitted for review";
    case "EDITED":
      return "Edited";
    case "UNPUBLISHED":
      return "Unpublished";
    default:
      return action;
  }
}