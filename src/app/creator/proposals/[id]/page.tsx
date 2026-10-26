"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EditorProposalReview from "@/components/EditorProposalReview";
import ProposalFullStory, { type StorySnapshot } from "@/components/ProposalFullStory";
import { blogsApi, type WriterEditorRevision } from "@/lib/api/blogs";
import { BlogPost } from "@/types";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

// Where the writer lands from the "Review Editor Changes" email link.
export default function CreatorProposalReviewPage() {
  const params = useParams<{ id: string }>();
  const storyId = params.id;

  const [story, setStory] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revision, setRevision] = useState<WriterEditorRevision | null>(null);

  const loadStory = useCallback(async () => {
    try {
      const data = await blogsApi.getContributorBlogById(storyId);
      setStory(data);
      setLoadError(null);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Unable to load this story.");
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  // The full story before and after the editor's changes, for the "Full story" view.
  useEffect(() => {
    blogsApi
      .getWriterEditorRevision(storyId)
      .then(setRevision)
      .catch(() => setRevision(null));
  }, [storyId]);

  const pending = story?.publishConsentStatus === "pending";

  let outcome: { tone: "ok" | "info"; text: string } | null = null;
  if (story && !pending) {
    if (story.publishConsentStatus === "approved") {
      outcome = { tone: "ok", text: "You accepted the editor's changes. They are now part of your story." };
    } else if (story.publishConsentStatus === "rejected") {
      outcome = { tone: "info", text: "You rejected the editor's changes. The editor has been sent your reason." };
    } else {
      outcome = { tone: "info", text: "No editor changes are waiting for your decision." };
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-20 font-sans text-[#1E2620]">
      <Header title="Editor Changes" subtitle="Review what the editor changed before your story is updated" />

      <main className="mx-auto max-w-4xl space-y-6 px-8 py-8">
        <Link href="/creator/my-stories" className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B3A5C] hover:underline">
          <ArrowLeft size={14} /> Back to my stories
        </Link>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 size={14} className="animate-spin" /> Loading the editor&apos;s changes…
          </div>
        )}

        {!loading && loadError && (
          <div role="alert" className="flex items-center gap-3 border-l-2 border-[#8B4136] bg-[#8B4136]/5 p-4 text-[#8B4136]">
            <AlertCircle size={16} />
            <p className="text-xs font-medium">{loadError}</p>
          </div>
        )}

        {story && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Story</p>
            <h2 className="mt-1 text-xl font-semibold text-[#1B3A5C]">{story.title}</h2>
          </div>
        )}

        {outcome && (
          <div
            role="status"
            className={`flex items-center gap-2.5 border-l-4 p-3.5 text-sm ${
              outcome.tone === "ok"
                ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                : "border-slate-400 bg-white text-slate-700"
            }`}
          >
            {outcome.tone === "ok" && <CheckCircle2 size={16} className="shrink-0 text-emerald-700" />}
            <span>{outcome.text}</span>
          </div>
        )}

        {pending && <EditorProposalReview storyId={storyId} onDecided={loadStory} />}

        {revision?.baseline && revision?.proposal && (
          <section aria-labelledby="full-story-heading" className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Full story</p>
              <h3 id="full-story-heading" className="mt-1 text-base font-semibold text-[#1B3A5C]">
                The story with the editor&apos;s changes marked
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Your version is compared with the editor&apos;s proposed version. Accept or reject the changes above.
              </p>
            </div>
            <ProposalFullStory
              baseline={revision.baseline as StorySnapshot}
              proposal={revision.proposal as StorySnapshot}
            />
          </section>
        )}
      </main>
    </div>
  );
}
