'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import BlogForm from "@/components/BlogForm";
import BlogActions from "@/components/BlogActions";
import { blogsApi } from "@/lib/api/blogs";
import { canEditBlog, canViewBlog } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { BlogPost, ROLE_LABELS, Role } from "@/types";
import {
  ArrowLeft,
  Clock,
  History,
  MessageSquare,
  ShieldCheck,
  Tag,
  User as UserIcon,
  AlertCircle,
  Quote,
} from "lucide-react";

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

  // ─── SKELETON LOADING STATE ────────────────────────────────────────────────
  if (loading || !user || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Blog Details" subtitle="Fetching article metadata and permissions..." />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-40 animate-pulse rounded-2xl bg-slate-200/80" />
              <div className="h-96 animate-pulse rounded-2xl bg-slate-200/80" />
            </div>
            <div className="space-y-6">
              <div className="h-64 animate-pulse rounded-2xl bg-slate-200/80" />
              <div className="h-48 animate-pulse rounded-2xl bg-slate-200/80" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── DENIED / NOT FOUND STATE ─────────────────────────────────────────────
  if (denied || !post) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Article Not Found" subtitle="Requested resource is unavailable" />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
            <p className="mt-2 text-sm text-slate-500">
              This post does not exist or you do not possess sufficient permissions to inspect its contents.
            </p>
            <button
              onClick={() => router.push("/dashboard/blogs")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeft size={16} />
              Return to Submissions
            </button>
          </div>
        </main>
      </div>
    );
  }

  const userRole = user.role as Role;
  const editable = canEditBlog(userRole, user._id, post);

  // Author Meta Extraction
  const authorObj = typeof post.author === "object" ? post.author : null;
  const authorName = authorObj
    ? `${authorObj.firstName || ""} ${authorObj.lastName || ""}`.trim() || authorObj.username
    : "Author";
  const authorRole = authorObj?.role || post.originalAuthorRole || "user";

  const statusStr = (post.status as string) || "";
  const historyList =
    (post as unknown as {
      history?: Array<{
        id?: string;
        action: string;
        by?: string;
        at: string | Date;
        note?: string;
      }>;
    }).history || [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header title={post.title} subtitle={`Created by ${authorName}`} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/blogs"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={14} className="text-slate-400" />
            Back to All Submissions
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Article Content / Editor Area */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header Metadata Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <StatusBadge status={post.status} />
                  {post.tag && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <Tag size={12} className="text-slate-400" />
                      #{post.tag}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Clock size={14} />
                  <span>
                    Updated {new Date(post.updatedAt || post.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Author Byline Box */}
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Author Byline
                    </p>
                    <p className="text-sm font-bold text-slate-900">{authorName}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-2xs ring-1 ring-slate-200/80">
                  <ShieldCheck size={13} className="text-indigo-600" />
                  {ROLE_LABELS[authorRole as keyof typeof ROLE_LABELS] || authorRole}
                </span>
              </div>
            </div>

            {/* Rejection / Review Feedback Callout */}
            {(statusStr === "rejected" || statusStr === "changes_requested") &&
              (post as unknown as { reviewNote?: string }).reviewNote && (
                <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 p-5 text-rose-900 shadow-2xs">
                  <div className="flex items-center gap-2 font-semibold text-rose-800">
                    <MessageSquare size={16} className="text-rose-600" />
                    <span>Editorial Review Notes</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-rose-700">
                    {(post as unknown as { reviewNote?: string }).reviewNote}
                  </p>
                </div>
              )}

            {/* Article Content Display or Editable Form */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
              {editable ? (
                <BlogForm
  mode="edit"
  role={userRole}
  creatorName={authorName}
  creatorRole={authorRole as Role}
  initial={
    {
      _id: post._id,
      title: post.title,
      excerpt: post.excerpt || "",
      tag: post.tag || "",
      blocks: post.blocks || [],
      status: post.status,
    } as any
  }
/>
              ) : (
                <article className="prose prose-slate max-w-none text-slate-800">
                  {post.excerpt && (
                    <div className="mb-6 rounded-xl border-l-4 border-indigo-500 bg-indigo-50/40 p-4 text-base font-medium text-slate-900">
                      {post.excerpt}
                    </div>
                  )}

                  {post.blocks && post.blocks.length > 0 ? (
                    <div className="space-y-5">
                      {post.blocks.map((block, idx) => {
                        const b = block as unknown as {
                          type: string;
                          content?: string;
                          value?: string;
                          text?: string;
                        };
                        const textVal = b.content || b.value || b.text || "";

                        return (
                          <div key={idx}>
                            {b.type === "heading" && (
                              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                {textVal}
                              </h2>
                            )}
                            {b.type === "text" && (
                              <p className="leading-relaxed text-slate-700">{textVal}</p>
                            )}
                            {b.type === "quote" && (
                              <blockquote className="my-4 flex gap-3 border-l-4 border-indigo-500 bg-slate-50 p-4 italic text-slate-700">
                                <Quote size={20} className="flex-shrink-0 text-indigo-500" />
                                <div>{textVal}</div>
                              </blockquote>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm font-medium text-slate-400">
                      No additional content blocks are attached to this post.
                    </p>
                  )}
                </article>
              )}
            </div>
          </div>

          {/* Sidebar Controls & History Timeline */}
          <div className="space-y-6">
            <BlogActions post={post} user={user} />

            {/* Audit History Timeline */}
            {historyList.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 font-semibold text-slate-900">
                  <History size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold">Activity History</h3>
                </div>

                <div className="relative pl-4 before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-0.5 before:bg-slate-200">
                  <ol className="space-y-5">
                    {[...historyList].reverse().map((h, idx) => (
                      <li key={h.id || idx} className="relative pl-4">
                        <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {historyLabel(h.action)}{" "}
                            {h.by && (
                              <span className="font-normal text-slate-500">by {h.by}</span>
                            )}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                            {new Date(h.at).toLocaleString()}
                          </p>
                          {h.note && (
                            <p className="mt-1.5 rounded-lg bg-slate-50 p-2 text-xs italic text-slate-600 ring-1 ring-slate-200/50">
                              &ldquo;{h.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function historyLabel(action: string) {
  const normAction = action.toUpperCase();
  switch (normAction) {
    case "CREATED":
      return "Created Draft";
    case "SUBMITTED":
      return "Submitted for Review";
    case "APPROVED":
      return "Approved";
    case "PUBLISHED":
      return "Published Live";
    case "REJECTED":
      return "Rejected";
    case "RESUBMITTED":
      return "Resubmitted";
    case "EDITED":
      return "Updated Article";
    case "UNPUBLISHED":
      return "Unpublished";
    default:
      return action;
  }
}