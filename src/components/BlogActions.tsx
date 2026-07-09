"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { can } from "@/lib/permissions";
import { BlogPost, SessionUser } from "@/types";

export default function BlogActions({
  post,
  user,
}: {
  post: BlogPost;
  user: SessionUser;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isOwner = post.authorId === user.id;
  const canReview = can(user.role, "blog:approve") || can(user.role, "blog:reject");
  const canPublish = can(user.role, "blog:publish");
  const canUnpublish = can(user.role, "blog:unpublish");

  async function call(path: string, opts: RequestInit = {}) {
    setBusy(true);
    setError(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Action failed");
      return false;
    }
    router.refresh();
    return true;
  }

  async function approve() {
    await call(`/api/blogs/${post.id}/approve`);
  }

  async function submitReject() {
    if (!reason.trim()) {
      setError("Please explain why this post is being rejected.");
      return;
    }
    const ok = await call(`/api/blogs/${post.id}/reject`, {
      body: JSON.stringify({ reason }),
    });
    if (ok) {
      setRejectOpen(false);
      setReason("");
    }
  }

  async function resubmit() {
    await call(`/api/blogs/${post.id}/resubmit`);
  }

  async function publish() {
    await call(`/api/blogs/${post.id}/publish`);
  }

  async function unpublish() {
    await call(`/api/blogs/${post.id}/publish`, { method: "DELETE" });
  }

  const showApproveReject = canReview && post.status === "PENDING";
  const showResubmit = isOwner && post.status === "REJECTED" && can(user.role, "blog:resubmit");
  const showPublish = canPublish && (post.status === "DRAFT" || post.status === "PENDING");
  const showUnpublish = canUnpublish && post.status === "APPROVED";

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
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            Fix & resubmit for review
          </button>
        )}

        {showPublish && (
          <button
            onClick={publish}
            disabled={busy}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
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