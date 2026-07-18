"use client";

import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { FileText, Send, X, CheckCircle2, Clock } from "lucide-react";
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
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const willPublish = canSelfPublish(role);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  function addTag() {
    const value = tagDraft.trim().replace(/,$/, "");
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
    }
    setTagDraft("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function save(submitForReview: boolean) {
    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      content,
      tags,
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

  const submitLabel = willPublish ? "Save & publish" : "Submit for review";
  const canSave = !submitting && !!title && !!content;

  return (
    <div className="mx-auto max-w-3xl">
      {/* ── Header strip ── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FileText size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {mode === "create" ? "New post" : "Edit post"}
            </p>
            <p className="text-xs text-slate-400">
              {mode === "create" ? "Draft a new blog entry" : "Update this blog entry"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            willPublish ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {willPublish ? <CheckCircle2 size={13} /> : <Clock size={13} />}
          {willPublish ? "Publishes immediately" : "Goes to review"}
        </span>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ── Editor card ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        {/* Title — editorial, borderless, large */}
        <div className="border-b border-slate-100 px-6 pt-6 pb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="How to grow your audience in 2026"
            className="w-full border-none bg-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
          />
        </div>

        {/* Tags — interactive chip input */}
        <div className="border-b border-slate-100 px-6 py-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className="rounded-full p-0.5 text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-700"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={tags.length === 0 ? "marketing, growth, social…" : "Add another…"}
              className="min-w-[140px] flex-1 border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Press Enter or comma to add a tag</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Content
            </label>
            <span className="text-[11px] text-slate-400">{wordCount} words</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder="Write your post..."
            className="w-full resize-y border-none bg-transparent text-sm leading-relaxed text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="sticky bottom-4 z-10 mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-lg shadow-slate-200/70 backdrop-blur">
        <p className="hidden text-xs text-slate-400 sm:block">
          {mode === "create" ? "Not published until you save" : "Changes save when you click below"}
        </p>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            onClick={() => save(false)}
            disabled={!canSave}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
          >
            Save as draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50 sm:flex-none"
          >
            {submitting ? (
              "Saving..."
            ) : (
              <>
                <Send size={14} />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}