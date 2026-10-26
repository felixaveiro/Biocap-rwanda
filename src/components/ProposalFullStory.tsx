"use client";

import { diffWords, type DiffSegment } from "@/lib/diff";
import { DiffText } from "@/components/EditorProposalReview";

// A story as stored in an editor proposal snapshot (the writer's version or the editor's version).
export interface StorySnapshot {
  title?: string;
  excerpt?: string;
  blocks?: { type?: string; text?: string; src?: string; [key: string]: unknown }[];
}

type Block = NonNullable<StorySnapshot["blocks"]>[number];

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

const blockText = (block: Block | null): string =>
  block ? String(block.text ?? (typeof block.src === "string" ? block.src : "")) : "";

const blockLabel = (block: Block | null): string => (block?.type && BLOCK_LABELS[block.type]) || "Block";

const blockSegments = (before: Block | null, after: Block | null): DiffSegment[] => {
  if (before?.type === "image" || after?.type === "image") {
    return [
      ...(before ? [{ type: "delete" as const, text: "previous image" }] : []),
      ...(after ? [{ type: "insert" as const, text: "new image" }] : []),
    ];
  }
  return diffWords(blockText(before), blockText(after));
};

// Shows the whole story as it would read after the proposal, with added text highlighted and removed text struck through.
// Blocks are compared by position, the same way the server records the proposal.
export default function ProposalFullStory({
  baseline,
  proposal,
}: {
  baseline: StorySnapshot;
  proposal: StorySnapshot;
}) {
  const beforeBlocks = baseline.blocks ?? [];
  const afterBlocks = proposal.blocks ?? [];
  const blockCount = Math.max(beforeBlocks.length, afterBlocks.length);

  const titleSegments = diffWords(baseline.title ?? "", proposal.title ?? "");
  const excerptSegments = diffWords(baseline.excerpt ?? "", proposal.excerpt ?? "");

  return (
    <article className="space-y-6 border border-[#E2DDCF] bg-white p-6">
      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
        <span>
          <ins className="rounded-sm bg-emerald-100 px-1 text-emerald-900 underline decoration-emerald-600">Added by editor</ins>
        </span>
        <span>
          <del className="rounded-sm bg-rose-50 px-1 text-rose-700 line-through decoration-rose-500">Removed by editor</del>
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1B3A5C]">Title</p>
        <div className="text-xl font-semibold text-[#1B3A5C]">
          <DiffText segments={titleSegments} />
        </div>
      </div>

      {(baseline.excerpt || proposal.excerpt) && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1B3A5C]">Summary</p>
          <DiffText segments={excerptSegments} />
        </div>
      )}

      <div className="space-y-4">
        {Array.from({ length: blockCount }, (_, index) => {
          const before = beforeBlocks[index] ?? null;
          const after = afterBlocks[index] ?? null;
          const unchanged = before !== null && after !== null && JSON.stringify(before) === JSON.stringify(after);
          const status = !before ? "added" : !after ? "removed" : "changed";

          if (unchanged) {
            return (
              <div key={index} className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{blockLabel(after)}</p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{blockText(after)}</p>
              </div>
            );
          }

          return (
            <div key={index} className="space-y-1 border-l-2 border-amber-300 pl-4">
              <p className="text-[10px] uppercase tracking-widest text-amber-800">
                {blockLabel(after ?? before)} · {status === "added" ? "added" : status === "removed" ? "removed" : "changed"}
              </p>
              <DiffText segments={blockSegments(before, after)} />
            </div>
          );
        })}
      </div>
    </article>
  );
}
