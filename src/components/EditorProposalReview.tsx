"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import {
  blogsApi,
  type EditorRevisionBlock,
  type EditorRevisionChange,
  type WriterEditorRevision,
} from "@/lib/api/blogs";
import { diffWords, htmlToText, type DiffSegment } from "@/lib/diff";

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  excerpt: "Excerpt",
  tag: "Tag",
  img: "Cover image",
  bodyHtml: "Body text",
};

// Fields that are shown elsewhere in this list, or are internal storage details.
const HIDDEN_FIELDS = new Set(["imgPublicId"]);

type Decision = "accept" | "reject";

// One reviewable change: a title, excerpt, body, or a single content block.
interface ReviewItem {
  key: string;
  label: string;
  segments: DiffSegment[];
}

const blockContent = (block: EditorRevisionBlock | null): string => {
  if (!block) return "";
  return block.text ?? (typeof block.src === "string" ? block.src : "");
};

const blockSegments = (before: EditorRevisionBlock | null, after: EditorRevisionBlock | null): DiffSegment[] => {
  if (before?.type === "image" || after?.type === "image") {
    return [
      ...(before ? [{ type: "delete" as const, text: "previous image" }] : []),
      ...(after ? [{ type: "insert" as const, text: "new image" }] : []),
    ];
  }
  return diffWords(blockContent(before), blockContent(after));
};

// Same labels as the backend's email, so the app and the email name each block the same way.
const BLOCK_LABELS: Record<string, string> = {
  p: "Paragraph",
  h1: "Heading",
  h2: "Subheading",
  quote: "Quote",
  list: "List",
  image: "Image",
  video: "Video",
  hero: "Hero",
  html: "HTML block",
};

const blockKind = (block: EditorRevisionBlock | null): string => (block?.type && BLOCK_LABELS[block.type]) || "Block";

const buildReviewItems = (changes: EditorRevisionChange[]): ReviewItem[] => {
  const items: ReviewItem[] = [];

  for (const change of changes) {
    if (HIDDEN_FIELDS.has(change.field)) continue;

    if (change.field === "blocks") {
      for (const block of change.changedBlocks ?? []) {
        const kind = blockKind(block.after ?? block.before);
        items.push({
          key: `block-${block.index}`,
          label: `${kind} ${block.index + 1}`,
          segments: blockSegments(block.before, block.after),
        });
      }
      continue;
    }

    const label = FIELD_LABELS[change.field] ?? change.field;
    const before = String(change.before ?? "");
    const after = String(change.after ?? "");

    if (change.field === "img") {
      items.push({
        key: "field-img",
        label,
        segments: [
          { type: "delete", text: "previous cover image" },
          { type: "insert", text: "new cover image" },
        ],
      });
      continue;
    }

    const segments =
      change.field === "bodyHtml" ? diffWords(htmlToText(before), htmlToText(after)) : diffWords(before, after);
    items.push({ key: `field-${change.field}`, label, segments });
  }

  return items;
};

export function DiffText({ segments }: { segments: DiffSegment[] }) {
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
      {segments.map((segment, index) => {
        if (segment.type === "insert") {
          return (
            <ins
              key={index}
              className="rounded-sm bg-emerald-100 px-0.5 text-emerald-900 no-underline underline decoration-emerald-600 decoration-2 underline-offset-2"
            >
              {segment.text}
            </ins>
          );
        }
        if (segment.type === "delete") {
          return (
            <del
              key={index}
              className="rounded-sm bg-rose-50 px-0.5 text-rose-700 line-through decoration-rose-500 decoration-2"
            >
              {segment.text}
            </del>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </p>
  );
}

const editorLabel = (revision: WriterEditorRevision): string => {
  const editor = revision.editor;
  if (!editor) return "An editor";
  const name = [editor.firstName, editor.lastName].filter(Boolean).join(" ");
  return name || editor.username || "An editor";
};

const formatDate = (value?: string): string =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

const DECISION_BUTTON =
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60";

export default function EditorProposalReview({
  storyId,
  onDecided,
}: {
  storyId: string;
  onDecided: () => void;
}) {
  const [revision, setRevision] = useState<WriterEditorRevision | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  const items = useMemo(() => buildReviewItems(revision?.changes ?? []), [revision]);
  const decidedCount = items.filter((item) => decisions[item.key]).length;
  const rejectedItems = items.filter((item) => decisions[item.key] === "reject");
  const reviewComplete = decidedCount === items.length;
  const approved = rejectedItems.length === 0;

  const setAll = (decision: Decision) => {
    setDecisions(Object.fromEntries(items.map((item) => [item.key, decision])));
    if (decisionError) setDecisionError(null);
  };

  const setDecision = (key: string, decision: Decision) => {
    setDecisions((current) => ({ ...current, [key]: decision }));
    if (decisionError) setDecisionError(null);
  };

  const submit = async () => {
    const reason = note.trim();
    if (!reviewComplete) {
      setDecisionError("Review every change before submitting.");
      return;
    }
    if (!approved && !reason) {
      setDecisionError("Please explain why you are rejecting the editor's changes.");
      return;
    }

    // The server records one decision for the whole proposal, so it is accepted only when every change is accepted.
    const rejectedNote = rejectedItems.length > 0 ? `Rejected changes: ${rejectedItems.map((item) => item.label).join(", ")}.` : "";

    try {
      setDecisionError(null);
      setSubmitting(true);
      await blogsApi.respondToWriterConsent(storyId, {
        approved,
        note: approved ? "Approved by writer." : [rejectedNote, reason].filter(Boolean).join(" "),
      });
      setNote("");
      setDecisions({});
      onDecided();
    } catch (err: unknown) {
      setDecisionError(err instanceof Error ? err.message : "Unable to record your decision.");
    } finally {
      setSubmitting(false);
    }
  };

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
              <p className="mt-1 text-xs text-slate-600">{loadError ?? "Loading the editor's changes…"}</p>
            )}
          </div>

          {revision && items.length === 0 && (
            <p className="text-sm text-slate-600">The proposal does not change any visible text.</p>
          )}

          {items.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <p>
                  <span className="mr-3">
                    <ins className="rounded-sm bg-emerald-100 px-1 text-emerald-900 underline decoration-emerald-600">
                      Added
                    </ins>
                  </span>
                  <span>
                    <del className="rounded-sm bg-rose-50 px-1 text-rose-700 line-through decoration-rose-500">
                      Deleted
                    </del>
                  </span>
                </p>
                <p>
                  {decidedCount} of {items.length} reviewed
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setAll("accept")}
                  className="rounded-full border border-emerald-700/30 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-800 disabled:opacity-60 cursor-pointer"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setAll("reject")}
                  className="rounded-full border border-rose-700/30 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-800 disabled:opacity-60 cursor-pointer"
                >
                  Reject all
                </button>
              </div>

              <ul className="space-y-3">
                {items.map((item) => {
                  const decision = decisions[item.key];
                  return (
                    <li
                      key={item.key}
                      className={`space-y-2 rounded-xl border bg-white p-3 ${
                        decision === "reject"
                          ? "border-rose-200"
                          : decision === "accept"
                            ? "border-emerald-200"
                            : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#1B3A5C]">{item.label}</p>
                        <div className="flex gap-2" role="group" aria-label={`Decision for ${item.label}`}>
                          <button
                            type="button"
                            aria-pressed={decision === "accept"}
                            disabled={submitting}
                            onClick={() => setDecision(item.key, "accept")}
                            className={`${DECISION_BUTTON} ${
                              decision === "accept"
                                ? "border-emerald-700 bg-emerald-700 text-white"
                                : "border-emerald-700/30 bg-white text-emerald-800"
                            }`}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            aria-pressed={decision === "reject"}
                            disabled={submitting}
                            onClick={() => setDecision(item.key, "reject")}
                            className={`${DECISION_BUTTON} ${
                              decision === "reject"
                                ? "border-rose-700 bg-rose-700 text-white"
                                : "border-rose-700/30 bg-white text-rose-800"
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <DiffText segments={item.segments} />
                    </li>
                  );
                })}
              </ul>

              {!approved && reviewComplete && (
                <p className="text-xs text-slate-600">
                  The proposal is only applied when every change is accepted. If you reject any change, the editor&apos;s
                  changes are removed and your story stays as you wrote it. The editor receives your reason.
                </p>
              )}
            </>
          )}

          <div>
            <label htmlFor="consent-note" className="block text-xs font-semibold text-[#1B3A5C]">
              Reason for rejecting (required when any change is rejected)
            </label>
            <textarea
              id="consent-note"
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                if (decisionError) setDecisionError(null);
              }}
              placeholder="Explain what needs to change. Optional when accepting every change."
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
              disabled={submitting || !revision}
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-full bg-[#1B3A5C] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60 cursor-pointer"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              {approved ? "Accept changes" : "Send back to editor"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
