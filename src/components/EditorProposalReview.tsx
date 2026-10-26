"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import {
  blogsApi,
  type EditorRevisionBlock,
  type EditorRevisionChange,
  type WriterEditorRevision,
} from "@/lib/api/blogs";

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  excerpt: "Excerpt",
  tag: "Tag",
  img: "Cover image",
  bodyHtml: "Body text",
};

// Fields that are shown elsewhere in this list, or are internal storage details.
const HIDDEN_FIELDS = new Set(["imgPublicId"]);

const blockText = (block: EditorRevisionBlock | null): string => {
  if (!block) return "";
  const text = block.text ?? (typeof block.src === "string" ? block.src : "");
  const summary = text.length > 240 ? `${text.slice(0, 240)}…` : text;
  return block.type ? `${block.type}: ${summary}` : summary;
};

const editorLabel = (revision: WriterEditorRevision): string => {
  const editor = revision.editor;
  if (!editor) return "An editor";
  const name = [editor.firstName, editor.lastName].filter(Boolean).join(" ");
  return name || editor.username || "An editor";
};

const formatDate = (value?: string): string =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

function ChangeRow({ change }: { change: EditorRevisionChange }) {
  if (change.field === "blocks") {
    return (
      <li className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1B3A5C]">
          Content blocks ({change.changedBlocks?.length ?? 0} changed)
        </p>
        {change.beforeCount !== change.afterCount && (
          <p className="text-xs text-slate-600">
            Block count: {change.beforeCount ?? 0} → {change.afterCount ?? 0}
          </p>
        )}
        <ul className="space-y-2">
          {(change.changedBlocks ?? []).map((block) => (
            <li key={block.index} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <p className="text-xs font-semibold text-slate-500">Block {block.index + 1}</p>
              {block.before && (
                <p className="mt-1 rounded-md bg-rose-50 px-2 py-1 text-rose-800 line-through decoration-rose-300">
                  {blockText(block.before)}
                </p>
              )}
              {block.after && (
                <p className="mt-1 rounded-md bg-emerald-50 px-2 py-1 text-emerald-900">{blockText(block.after)}</p>
              )}
              {!block.after && <p className="mt-1 text-xs italic text-slate-500">Removed in the proposal</p>}
              {!block.before && <p className="mt-1 text-xs italic text-slate-500">Added in the proposal</p>}
            </li>
          ))}
        </ul>
      </li>
    );
  }

  const label = FIELD_LABELS[change.field] ?? change.field;
  const before = String(change.before ?? "");
  const after = String(change.after ?? "");

  return (
    <li className="space-y-1 text-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-[#1B3A5C]">{label}</p>
      {change.field === "bodyHtml" || change.field === "img" ? (
        <p className="text-xs text-slate-600">{label} was changed. Compare the story after accepting to review it.</p>
      ) : (
        <>
          <p className="rounded-md bg-rose-50 px-2 py-1 text-rose-800 line-through decoration-rose-300">{before || "(empty)"}</p>
          <p className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-900">{after || "(empty)"}</p>
        </>
      )}
    </li>
  );
}

export default function EditorProposalReview({
  storyId,
  onDecided,
}: {
  storyId: string;
  onDecided: () => void;
}) {
  const [revision, setRevision] = useState<WriterEditorRevision | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    blogsApi
      .getWriterEditorRevision(storyId)
      .then((data) => {
        if (active) setRevision(data);
      })
      .catch((err: unknown) => {
        if (active) setLoadError(err instanceof Error ? err.message : "Unable to load the editor's changes.");
      });
    return () => {
      active = false;
    };
  }, [storyId]);

  const decide = async (approved: boolean) => {
    const reason = note.trim();
    if (!approved && !reason) {
      setDecisionError("Please explain why you are rejecting the editor changes.");
      return;
    }

    try {
      setDecisionError(null);
      setSubmitting(approved ? "approve" : "reject");
      await blogsApi.respondToWriterConsent(storyId, {
        approved,
        note: approved ? "Approved by writer." : reason,
      });
      setNote("");
      onDecided();
    } catch (err: unknown) {
      setDecisionError(err instanceof Error ? err.message : "Unable to record your decision.");
    } finally {
      setSubmitting(null);
    }
  };

  const changes = (revision?.changes ?? []).filter((change) => !HIDDEN_FIELDS.has(change.field));

  return (
    <section
      aria-labelledby="editor-proposal-heading"
      className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-slate-700"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 shrink-0 text-amber-700" size={18} />
        <div className="flex-1 space-y-4">
          <div>
            <p id="editor-proposal-heading" className="text-sm font-semibold text-[#1B3A5C]">
              Writer review required
            </p>
            {revision ? (
              <p className="mt-1 text-xs text-slate-600">
                {editorLabel(revision)} proposed these changes
                {revision.proposedAt ? ` on ${formatDate(revision.proposedAt)}` : ""}. Your story is unchanged until you
                accept them.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-600">
                {loadError ?? "Loading the editor's changes…"}
              </p>
            )}
          </div>

          {revision && changes.length === 0 && (
            <p className="text-sm text-slate-600">The proposal does not change any visible text.</p>
          )}

          {changes.length > 0 && (
            <ul className="space-y-4">
              {changes.map((change) => (
                <ChangeRow key={change.field} change={change} />
              ))}
            </ul>
          )}

          <div>
            <label htmlFor="consent-note" className="block text-xs font-semibold text-[#1B3A5C]">
              Reason for rejecting (required to reject)
            </label>
            <textarea
              id="consent-note"
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                if (decisionError) setDecisionError(null);
              }}
              placeholder="Explain what needs to change. Optional when approving."
              aria-invalid={decisionError ? true : undefined}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 focus:border-[#1B3A5C]"
              rows={3}
            />
            {decisionError && (
              <p role="alert" className="mt-2 text-xs font-medium text-[#C22055]">
                {decisionError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!!submitting || !revision}
              onClick={() => decide(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1B3A5C] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60 cursor-pointer"
            >
              {submitting === "approve" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Accept changes
            </button>
            <button
              type="button"
              disabled={!!submitting || !revision}
              onClick={() => decide(false)}
              className="inline-flex items-center gap-2 rounded-full border border-[#1B3A5C]/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1B3A5C] disabled:opacity-60 cursor-pointer"
            >
              {submitting === "reject" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Reject changes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
