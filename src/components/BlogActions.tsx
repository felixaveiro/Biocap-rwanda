"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { can, Permission } from "@/lib/permissions";
import { blogsApi } from "@/lib/api/blogs";
import { BlogPost, User, Role } from "@/types";

export default function BlogActions({
  post,
  user,
}: {
  post: BlogPost;
  user: User;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const userRole = user.role as Role;
  const authorId =
    typeof post.author === "object"
      ? post.author?._id
      : (post as unknown as { authorId?: string }).authorId || post.author;
  const isOwner = authorId === user._id;

  const canReview = can(userRole, "blog:approve") || can(userRole, "blog:reject");
  const canPublish = can(userRole, "blog:publish");
  const canUnpublish = can(userRole, "blog:unpublish");

  const statusKey = (post.status as string)?.toLowerCase() || "";

  async function executeAction(actionFn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await actionFn();
      router.refresh();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setError(msg);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    await executeAction(() =>
      blogsApi.reviewBlog(post._id, { decision: "approved" })
    );
  }

  async function submitReject() {
    if (!reason.trim()) {
      setError("Please explain why this post is being rejected.");
      return;
    }
    const ok = await executeAction(() =>
      blogsApi.reviewBlog(post._id, { decision: "rejected", note: reason })
    );
    if (ok) {
      setRejectOpen(false);
      setReason("");
    }
  }

  async function resubmit() {
    await executeAction(() => blogsApi.submitBlog(post._id));
  }

  async function publish() {
    await executeAction(() => blogsApi.publishBlog(post._id));
  }

  async function unpublish() {
    await executeAction(() => blogsApi.unpublishBlog(post._id));
  }

  const showApproveReject =
    canReview && (statusKey === "pending_review" || statusKey === "pending");
  const showResubmit =
    isOwner &&
    (statusKey === "rejected" || statusKey === "changes_requested") &&
    can(userRole, "blog:resubmit" as Permission);
  const showPublish =
    canPublish &&
    (statusKey === "approved" || statusKey === "draft" || statusKey === "pending_review");
  const showUnpublish = canUnpublish && statusKey === "published";

  if (!showApproveReject && !showResubmit && !showPublish && !showUnpublish) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">Workflow actions</h3>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        {showApproveReject && (
          <>
            <button
              onClick={approve}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              Approve & publish
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              disabled={busy}
              className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}

        {showResubmit && (
          <button
            onClick={resubmit}
            disabled={busy}
            className="rounded-lg bg-[#E52B67] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c42155] disabled:opacity-50"
          >
            Fix & resubmit for review
          </button>
        )}

        {showPublish && (
          <button
            onClick={publish}
            disabled={busy}
            className="rounded-lg bg-[#133248] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0e273a] disabled:opacity-50"
          >
            Publish now
          </button>
        )}

        {showUnpublish && (
          <button
            onClick={unpublish}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Unpublish
          </button>
        )}
      </div>

      {rejectOpen && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Reason for rejection
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Explain what needs to change before this can be approved..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#E52B67] focus:outline-none focus:ring-2 focus:ring-[#E52B67]/20"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={submitReject}
              disabled={busy}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              Confirm rejection
            </button>
            <button
              onClick={() => setRejectOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}