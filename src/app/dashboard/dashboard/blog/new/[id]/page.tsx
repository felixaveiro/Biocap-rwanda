'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import BlogForm from "@/components/BlogForm";
import BlogActions from "@/components/BlogActions";
import { getBlog } from "@/lib/data";
import { canEditBlog, canViewBlog } from "@/lib/permissions";
import { useSession } from "@/hooks/useSession";
import { BlogPost } from "@/types";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useSession();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!user) return;
    getBlog(params.id).then((found) => {
      if (!found || !canViewBlog(user.role, user.id, found)) {
        setDenied(true);
      } else {
        setPost(found);
      }
      setDataLoading(false);
    });
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
          <button className="text-brand-600 underline" onClick={() => router.push("/dashboard/blog")}>
            Back to blogs
          </button>
        </div>
      </div>
    );
  }

  const editable = canEditBlog(user.role, user.id, post);

  return (
    <div>
      <Header title={post.title} subtitle={`By ${post.authorName}`} />
      <div className="grid gap-6 p-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <StatusBadge status={post.status} />
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                #{tag}
              </span>
            ))}
          </div>

          {post.status === "REJECTED" && post.rejectionReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Rejected{post.reviewerName ? ` by ${post.reviewerName}` : ""}</p>
              <p className="mt-1">{post.rejectionReason}</p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            {editable ? (
              <BlogForm
                mode="edit"
                role={user.role}
                initial={{ id: post.id, title: post.title, content: post.content, tags: post.tags }}
              />
            ) : (
              <article className="prose prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-700">
                {post.content}
              </article>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <BlogActions post={post} user={user} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">History</h3>
            <ol className="mt-3 space-y-3">
              {[...post.history].reverse().map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="font-medium text-slate-800">
                    {historyLabel(h.action)} <span className="font-normal text-slate-400">by {h.by}</span>
                  </p>
                  <p className="text-xs text-slate-400">{new Date(h.at).toLocaleString()}</p>
                  {h.note && <p className="mt-1 text-xs text-slate-500">&ldquo;{h.note}&rdquo;</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function historyLabel(action: string) {
  switch (action) {
    case "CREATED": return "Created";
    case "SUBMITTED": return "Submitted for review";
    case "APPROVED": return "Approved & published";
    case "REJECTED": return "Rejected";
    case "RESUBMITTED": return "Resubmitted for review";
    case "EDITED": return "Edited";
    case "UNPUBLISHED": return "Unpublished";
    default: return action;
  }
}