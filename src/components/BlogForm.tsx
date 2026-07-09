"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BlogPost, Role } from "@/types";

interface Props {
  mode: "create" | "edit";
  role: Role;
  initial?: Pick<BlogPost, "id" | "title" | "content" | "tags">;
}

const canSelfPublish = (role: Role) => role === "ADMIN" || role === "COMMUNICATION_OFFICER";

export default function BlogForm({ mode, role, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(submitForReview: boolean) {
    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      submitForReview,
    };

    const res =
      mode === "create"
        ? await fetch("/api/blogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/blogs/${initial!.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    const data = await res.json();
    const id = data.blog?.id ?? initial?.id;
    router.push(`/dashboard/blog/${id}`);
    router.refresh();
  }

  const submitLabel = canSelfPublish(role)
    ? "Save & publish"
    : "Submit for review";

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="How to grow your audience in 2026"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="marketing, growth, social"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-xs text-slate-400">Comma separated</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          placeholder="Write your post..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => save(false)}
          disabled={submitting || !title || !content}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          onClick={() => save(true)}
          disabled={submitting || !title || !content}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
}