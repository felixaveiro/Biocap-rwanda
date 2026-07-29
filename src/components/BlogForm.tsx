"use client";

import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { FileText, Send, X, CheckCircle2, Clock, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { BlogPost, BlogBlock, ROLE_LABELS, Role } from "@/types";
import { blogsApi } from "@/lib/api/blogs";
import { ApiError } from "@/lib/api/client";

interface Props {
  mode: "create" | "edit";
  role: Role;
  creatorName?: string;
  creatorRole?: Role;
  initial?: BlogPost;
}

const canSelfPublish = (role: Role) =>
  role === "admin" || role === "communication_officer" || role === "editor";

export default function BlogForm({ mode, role, creatorName, creatorRole, initial }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [socialHandle, setSocialHandle] = useState(initial?.socialHandle ?? "");
  const [organizationLink, setOrganizationLink] = useState(initial?.organizationLink ?? "");

  // Block Engine State
  const [blocks, setBlocks] = useState<BlogBlock[]>(
    initial?.blocks && initial.blocks.length > 0
      ? initial.blocks
      : [{ type: "p", text: "" }]
  );

  // File Upload State
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const willPublish = canSelfPublish(role);

  // Block Helpers
  const addBlock = (type: BlogBlock["type"]) => {
    setBlocks([...blocks, { type, text: "" }]);
  };

  const updateBlock = (index: number, key: keyof BlogBlock, value: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [key]: value };
    setBlocks(updated);
  };

  const removeBlock = (index: number) => {
    if (blocks.length === 1) return;
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  async function handleSubmit(submitForReview: boolean) {
    setError(null);

    if (!title || !tag || !excerpt) {
      setError("Title, tag, and summary excerpt are required.");
      return;
    }

    if (mode === "create" && !imgFile) {
      setError("A cover image is required for new blog posts.");
      return;
    }

    setSubmitting(true);

    try {
      let savedBlog: BlogPost;

      if (mode === "create") {
        savedBlog = await blogsApi.createBlog(
          {
            title,
            tag,
            excerpt,
            blocks,
            socialHandle: socialHandle || undefined,
            organizationLink: organizationLink || undefined,
            img: imgFile!,
            document: documentFile || undefined,
          },
          role
        );
      } else {
        savedBlog = await blogsApi.updateBlog(
          initial!._id,
          {
            title,
            tag,
            excerpt,
            blocks,
            socialHandle: socialHandle || undefined,
            organizationLink: organizationLink || undefined,
            img: imgFile || undefined,
            document: documentFile || undefined,
          },
          role
        );
      }

      // If contributor submitting directly for review
      if (submitForReview && (role === "broadcast_content_creator" || role === "social_media_content_creator")) {
        await blogsApi.submitBlog(savedBlog._id, role);
      }

      router.push("/dashboard/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save blog post.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const submitLabel = willPublish ? "Save & Publish" : "Submit for Review";
  const canSave = !submitting && !!title && !!tag && !!excerpt && (mode === "edit" || !!imgFile);
  const bylineLabel = creatorName
    ? `${creatorName} · ${creatorRole ? ROLE_LABELS[creatorRole] : "Creator"}`
    : "Creator byline";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Creator Info Strip ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Creator Byline</p>
            <p className="text-sm font-medium text-slate-800">{bylineLabel}</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            {willPublish ? "Direct Publishing Allowed" : "Requires Staff Approval"}
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#133248] text-white">
            <FileText size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {mode === "create" ? "New Article Entry" : "Edit Article Entry"}
            </p>
            <p className="text-xs text-slate-400">
              {mode === "create" ? "Compose story using blocks" : "Update structured article blocks"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            willPublish ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {willPublish ? <CheckCircle2 size={13} /> : <Clock size={13} />}
          {willPublish ? "Direct Publish" : "Goes to Review"}
        </span>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* ── Main Form Card ── */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Advancing Biodiversity Research in 2026"
            className="w-full border-b border-slate-200 py-2 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-[#E52B67] focus:outline-none"
          />
        </div>

        {/* Tag & Excerpt */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Category Tag *
            </label>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Research, Climate, Biodiversity"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E52B67]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Social Handle (Optional)
            </label>
            <input
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              placeholder="@username"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E52B67]"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Summary Excerpt *
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Brief preview excerpt shown on public cards..."
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E52B67]"
          />
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Cover Image {mode === "create" ? "*" : "(Optional replacement)"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImgFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              PDF Document Attachment (Optional)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
        </div>

        {/* ── Block Content Builder ── */}
        <div className="pt-4">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Article Content Blocks
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => addBlock("p")}
                className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                + Paragraph
              </button>
              <button
                type="button"
                onClick={() => addBlock("h2")}
                className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                + Heading
              </button>
              <button
                type="button"
                onClick={() => addBlock("quote")}
                className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                + Quote
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {blocks.map((block, index) => (
              <div key={index} className="group relative flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="mt-1.5 min-w-[60px] text-[10px] font-bold uppercase text-slate-400">
                  {block.type}
                </div>

                <div className="flex-1 space-y-2">
                  <textarea
                    value={block.text || ""}
                    onChange={(e) => updateBlock(index, "text", e.target.value)}
                    rows={block.type === "h2" ? 1 : 3}
                    placeholder={`Enter ${block.type} text...`}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E52B67]"
                  />
                  {block.type === "quote" && (
                    <input
                      value={block.source || ""}
                      onChange={(e) => updateBlock(index, "source", e.target.value)}
                      placeholder="Quote attribution / source..."
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 focus:outline-none"
                    />
                  )}
                </div>

                {blocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Action Bar ── */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur">
        <p className="hidden text-xs text-slate-400 sm:block">
          {mode === "create" ? "Drafts remain private until submitted" : "Changes apply upon saving"}
        </p>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!canSave}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={!canSave}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#133248] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0e273a] disabled:opacity-50 sm:flex-none"
          >
            {submitting ? (
              "Processing..."
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