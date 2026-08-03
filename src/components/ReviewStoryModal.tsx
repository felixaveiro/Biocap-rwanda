'use client';

import { useState } from "react";
import { BlogPost, Role } from "@/types";
import { blogsApi } from "@/lib/api/blogs";
import ImageCropperModal from "@/components/ImageCropperModal";
import { base64ToFile } from "@/lib/utils/file";
import {
  X,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  AlertCircle,
  Tag,
  User as UserIcon,
  Crop,
} from "lucide-react";

interface ReviewStoryModalProps {
  story: BlogPost;
  currentUserRole: Role;
  onClose: () => void;
  onReviewCompleted: () => void;
}

export default function ReviewStoryModal({
  story,
  currentUserRole,
  onClose,
  onReviewCompleted,
}: ReviewStoryModalProps) {
  const [revisionFeedbackNote, setRevisionFeedbackNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── Image & Cropping States ───────────────────────────────────────────────
  const [currentImgUrl, setCurrentImgUrl] = useState<string>(story.img || "");
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Author Display Name Resolution
  const authorName = story.author?.firstName
    ? `${story.author.firstName} ${story.author.lastName || ""}`.trim()
    : story.author?.username || story.originalAuthor?.firstName || "Contributor";

  // Triggered when user clicks "Apply Crop" inside ImageCropperModal
  const handleCropSave = (croppedBase64: string) => {
    // 1. Immediately replace preview inside review modal
    setCurrentImgUrl(croppedBase64);

    // 2. Convert Base64 output to File for backend upload
    const file = base64ToFile(croppedBase64, `cropped-${story._id}.jpg`);
    setCroppedImageFile(file);

    // 3. Ensure cropper modal closes
    setIsCropperOpen(false);
  };

  const handleDecision = async (decision: "approve" | "reject") => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (decision === "approve") {
        // If the reviewer cropped/aligned the image, update the story image on backend first
        if (croppedImageFile) {
          await blogsApi.updateBlog(
            story._id,
            { img: croppedImageFile },
            currentUserRole
          );
        }

        // Approve article
        await blogsApi.approveBlog(story._id, currentUserRole);
      } else {
        if (!revisionFeedbackNote.trim()) {
          setErrorMessage("Please enter revision notes before requesting changes.");
          setIsSubmitting(false);
          return;
        }

        await blogsApi.rejectBlog(story._id, revisionFeedbackNote, currentUserRole);
      }

      onReviewCompleted();
      onClose();
    } catch (error: unknown) {
      console.error(`Failed to ${decision} story:`, error);
      const msg = error instanceof Error ? error.message : `Failed to ${decision} story.`;
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <div className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Review Story Submission</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Article Preview Column */}
              <div className="lg:col-span-2 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                    <Tag size={12} /> {story.tag || "General"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <UserIcon size={12} /> Author: {authorName}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900">{story.title}</h2>

                {/* Cover Image Container with Floating Crop Button */}
                {currentImgUrl && (
                  <div className="relative group overflow-hidden rounded-xl bg-slate-100 max-h-64 shadow-xs">
                    <img
                      src={currentImgUrl}
                      alt={story.title}
                      className="w-full h-full object-cover rounded-xl"
                    />

                    {/* Floating Crop Button */}
                    <button
                      type="button"
                      onClick={() => setIsCropperOpen(true)}
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md shadow-md hover:bg-slate-900 transition"
                    >
                      <Crop size={14} className="text-[#E52B67]" />
                      Crop & Align Image
                    </button>
                  </div>
                )}

                {story.excerpt && (
                  <p className="rounded-xl bg-slate-50 p-3 text-xs italic font-medium text-slate-600">
                    "{story.excerpt}"
                  </p>
                )}

                <div className="prose prose-slate max-w-none text-xs text-slate-800 space-y-2">
                  {story.blocks && story.blocks.length > 0 ? (
                    story.blocks.map((block, idx) => (
                      <p key={idx}>{block.text || block.caption || ""}</p>
                    ))
                  ) : (
                    <p>No body text content provided.</p>
                  )}
                </div>
              </div>

              {/* Editorial Control Sidebar */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Editorial Feedback</h4>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <MessageSquare size={13} /> Revision Notes
                  </label>
                  <textarea
                    rows={5}
                    value={revisionFeedbackNote}
                    onChange={(e) => setRevisionFeedbackNote(e.target.value)}
                    placeholder="Leave feedback if requesting changes..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleDecision("approve")}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Approve Article {croppedImageFile ? "(with new crop)" : ""}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleDecision("reject")}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
                    Request Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Viewport Modal */}
      {currentImgUrl && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={currentImgUrl}
          aspectRatio={16 / 9}
          onClose={() => setIsCropperOpen(false)}
          onSave={handleCropSave}
        />
      )}
    </>
  );
}