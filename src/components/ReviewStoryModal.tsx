'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { BlogPost, Role, Comment, BlogBlock } from "@/types";
import { blogsApi, officerApi } from "@/lib/api/blogs";
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
  Send,
  Clock,
  Edit3,
  AtSign,
  Globe,
  FileText,
  Plus,
  Trash2,
  Eye,
  Feather,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

// ── Type system (matches the rest of the editorial suite) ──────
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

// ── Palette — canvas #F3F2ED · ink #1E2620 · moss #3F6B4F · gold #A9812F · clay #B65C4B · line #D9D4C6

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

  // ─── Editable Content States ──────────────────────────────────────────────
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(story.title || "");
  const [editedExcerpt, setEditedExcerpt] = useState(story.excerpt || "");
  const [editedBlocks, setEditedBlocks] = useState<BlogBlock[]>(() => {
    if (story.blocks && story.blocks.length > 0) {
      return story.blocks;
    }
    return [{ type: "p", text: "" }];
  });

  // Track newly attached image Files for dynamic body section blocks
  const [editedSectionFiles, setEditedSectionFiles] = useState<Record<number, File>>({});

  // ─── Cover Image & Cropping States ─────────────────────────────────────────
  const [currentImgUrl, setCurrentImgUrl] = useState<string>(story.img || "");
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingCropImageSrc, setPendingCropImageSrc] = useState<string | null>(null);

  // File Input Refs
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // ─── Discussion / Comments States ─────────────────────────────────────────
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  // ─── Portal mount guard (avoids SSR document access) ──────────────────────
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isEditor = currentUserRole === "editor";
  const isOfficer = currentUserRole === "communication_officer" || currentUserRole === "admin";
  const isPublished = story.status === "published";

  // Author Display Name Resolution
  const authorName = story.author?.firstName
    ? `${story.author.firstName} ${story.author.lastName || ""}`.trim()
    : story.author?.username || story.originalAuthor?.firstName || "Contributor";

  const fetchComments = useCallback(async () => {
    if (!story._id) return;
    try {
      const data = await officerApi.getArticleComments(story._id);
      setComments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err?.status === 403) {
        console.warn("Role does not have permission to read internal comments.");
        setComments([]);
        return;
      }
      console.error("Failed to fetch comments for story:", err);
    }
  }, [story._id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ─── Cover Image Upload Handlers ───────────────────────────────────────────
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Src = reader.result as string;
      setPendingCropImageSrc(base64Src);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropSave = (croppedBase64: string) => {
    setCurrentImgUrl(croppedBase64);
    const file = base64ToFile(croppedBase64, `cover-edited-${story._id}.jpg`);
    setCroppedImageFile(file);
    setIsCropperOpen(false);
    setPendingCropImageSrc(null);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await officerApi.addArticleComment(story._id, newCommentText.trim());
      if (res.comment) {
        setComments((prev) => [...prev, res.comment]);
      } else {
        await fetchComments();
      }
      setNewCommentText("");
    } catch (err: any) {
      alert(err.message || "Failed to post comment.");
    } finally { // 🟢 Fixed typo "fontally" to "finally"
      setIsPostingComment(false);
    }
  };

  // ─── Block Editing Helpers ──────────────────────────────────────────────────
  const updateBlockText = (index: number, text: string) => {
    setEditedBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, text } : b))
    );
  };

  const updateBlockFitMode = (index: number, fitMode: "cover" | "contain") => {
    setEditedBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, fitMode } : b))
    );
  };

  const updateBlockCaption = (index: number, caption: string) => {
    setEditedBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, caption } : b))
    );
  };

  const handleSectionImageChange = (index: number, file?: File | null) => {
    if (!file) return;

    const fileKey = `${crypto.randomUUID()}__inline_editor.jpg`;
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      setEditedBlocks((prev) =>
        prev.map((b, i) =>
          i === index
            ? {
                ...b,
                type: "image",
                src: base64,
                fileKey,
                fitMode: b.fitMode || "cover",
              }
            : b
        )
      );

      const renamedFile = base64ToFile(base64, fileKey);
      setEditedSectionFiles((prev) => ({ ...prev, [index]: renamedFile }));
    };

    reader.readAsDataURL(file);
  };

  const removeBlock = (index: number) => {
    setEditedBlocks((prev) => prev.filter((_, i) => i !== index));
    setEditedSectionFiles((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const addTextBlock = () => {
    setEditedBlocks((prev) => [...prev, { type: "p", text: "" }]);
  };

  const addImageBlock = () => {
    setEditedBlocks((prev) => [
      ...prev,
      { type: "image", src: "", caption: "", fitMode: "cover" },
    ]);
  };

  // ─── Decision Submission ──────────────────────────────────────────────────
  const handleDecision = async (decision: "approve" | "reject") => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (decision === "approve") {
        const hasSectionImageEdits = Object.keys(editedSectionFiles).length > 0;
        const hasContentEdits =
          editedTitle !== story.title ||
          editedExcerpt !== story.excerpt ||
          JSON.stringify(editedBlocks) !== JSON.stringify(story.blocks) ||
          croppedImageFile !== null ||
          hasSectionImageEdits;

        if (isEditor && hasContentEdits) {
          const updatePayload: Record<string, any> = {
            title: editedTitle,
            excerpt: editedExcerpt,
            blocks: JSON.stringify(editedBlocks),
          };

          if (croppedImageFile) {
            updatePayload.img = croppedImageFile;
          }

          const newInlineFiles = Object.values(editedSectionFiles);
          if (newInlineFiles.length > 0) {
            updatePayload.images = newInlineFiles;
          }

          await blogsApi.updateBlog(story._id, updatePayload, currentUserRole);
        }

        if (isOfficer && story.editorModifications) {
          await officerApi.acceptEditorChanges(story._id, {
            approvalNote: revisionFeedbackNote,
          });
        } else {
          await blogsApi.approveBlog(story._id, currentUserRole);
        }
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

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  if (!isMounted) return null;

  return createPortal(
    <>
      <div
        className={`${fontVars} fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E2620]/40 p-4 backdrop-blur-md animate-in fade-in duration-150`}
        style={bodyFont}
      >
        <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-[#D9D4C6] bg-[#FDFCFA] shadow-2xl">
          <input
            type="file"
            ref={coverFileInputRef}
            onChange={handleCoverFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Modal masthead */}
          <div className="flex items-center justify-between border-b border-[#D9D4C6] bg-[#F3F2ED] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="border border-[#D9D4C6] bg-white p-2 text-[#3F6B4F]">
                <Feather size={17} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#8B9188]" style={monoFont}>
                  {isPublished ? "Published" : "Under review"}
                </p>
                <h3 className="text-[15px] italic leading-tight text-[#1E2620]" style={displayFont}>
                  {isPublished
                    ? "Published article review"
                    : isEditor
                    ? "Editor workspace & review desk"
                    : "Review story submission"}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="border border-transparent p-2 text-[#8B9188] transition-colors hover:border-[#D9D4C6] hover:text-[#1E2620]"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {errorMessage && (
              <div className="flex items-center gap-2 border-l-2 border-[#B65C4B] bg-[#FBEEEC] p-4 text-xs font-medium text-[#7A362A]">
                <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-6 border-[#EDEAE0] pr-0 lg:col-span-2 lg:border-r lg:pr-8">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEAE0] pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3A4239]"
                    >
                      <Tag size={11} /> {story.tag || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#6B7268]">
                      <UserIcon size={12} className="text-[#8B9188]" /> {authorName}
                    </span>
                  </div>

                  {isEditor && !isPublished && (
                    <button
                      type="button"
                      onClick={() => setIsEditingContent(!isEditingContent)}
                      className="inline-flex items-center gap-1.5 border border-[#3F6B4F]/40 bg-[#F1F5F1] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#3F6B4F] transition-colors hover:bg-[#3F6B4F] hover:text-white"
                    >
                      {isEditingContent ? (
                        <>
                          <Eye size={13} /> Preview mode
                        </>
                      ) : (
                        <>
                          <Edit3 size={13} /> Edit story & images
                        </>
                      )}
                    </button>
                  )}
                </div>

                {(story.socialHandle || story.organizationLink || story.document) && (
                  <div className="flex flex-wrap items-center gap-4 border border-[#EDEAE0] bg-[#FAF9F5] p-3 text-xs text-[#5A6259]">
                    {story.socialHandle && (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#3A4239]">
                        <AtSign size={13} className="text-[#3F6B4F]" /> {story.socialHandle}
                      </span>
                    )}
                    {story.organizationLink && (
                      <a
                        href={story.organizationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#3F6B4F] hover:underline"
                      >
                        <Globe size={13} /> {story.organizationLink}
                      </a>
                    )}
                    {story.document && (
                      <a
                        href={story.document}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#4A6E8A] hover:underline"
                      >
                        <FileText size={13} /> Attached PDF
                      </a>
                    )}
                  </div>
                )}

                {isEditingContent ? (
                  <div className="space-y-5 border border-[#3F6B4F]/25 bg-[#F1F5F1] p-5">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#2F4F3B]">
                        Story headline
                      </label>
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        style={displayFont}
                        className="w-full border border-[#D9D4C6] bg-white p-3 text-base italic text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#2F4F3B]">
                        Excerpt / summary
                      </label>
                      <textarea
                        rows={2}
                        value={editedExcerpt}
                        onChange={(e) => setEditedExcerpt(e.target.value)}
                        className="w-full border border-[#D9D4C6] bg-white p-2.5 text-xs text-[#3A4239] focus:border-[#3F6B4F] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#2F4F3B]">
                        Cover image
                      </label>

                      {currentImgUrl ? (
                        <div className="group relative flex max-h-72 items-center justify-center overflow-hidden border border-[#D9D4C6] bg-[#1E2620]">
                          <img
                            src={currentImgUrl}
                            alt="Cover preview"
                            className="max-h-72 w-full object-contain"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPendingCropImageSrc(currentImgUrl);
                                setIsCropperOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 border border-white/20 bg-[#1E2620]/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#1E2620]"
                            >
                              <Crop size={13} className="text-[#8FBF9F]" /> Recrop
                            </button>

                            <button
                              type="button"
                              onClick={() => coverFileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 border border-[#3F6B4F] bg-[#3F6B4F]/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#3F6B4F]"
                            >
                              <Upload size={13} /> Change cover
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center border-2 border-dashed border-[#3F6B4F]/40 bg-white p-6 text-[#3F6B4F] transition hover:bg-[#F1F5F1]"
                        >
                          <Upload size={22} strokeWidth={1.5} className="mb-1" />
                          <span className="text-xs font-semibold">Upload cover image</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 border-t border-[#3F6B4F]/20 pt-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#2F4F3B]">
                          Story body sections ({editedBlocks.length})
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={addTextBlock}
                            className="inline-flex items-center gap-1 border border-[#3F6B4F]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#3F6B4F] hover:bg-[#F1F5F1]"
                          >
                            <Plus size={13} /> Paragraph
                          </button>
                          <button
                            type="button"
                            onClick={addImageBlock}
                            className="inline-flex items-center gap-1 border border-[#3F6B4F]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#3F6B4F] hover:bg-[#F1F5F1]"
                          >
                            <ImageIcon size={13} /> Inline photo
                          </button>
                        </div>
                      </div>

                      {editedBlocks.map((block, idx) => (
                        <div key={idx} className="relative space-y-3 border border-[#E2DDCF] bg-white p-3.5">
                          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-[#8B9188]">
                            <span>Section #{idx + 1} ({block.type === "image" ? "Inline image" : "Paragraph"})</span>
                            {editedBlocks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBlock(idx)}
                                className="p-1 text-[#B65C4B] hover:text-[#8A3A2C]"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          {block.type === "p" || !block.type ? (
                            <textarea
                              rows={4}
                              value={block.text || ""}
                              onChange={(e) => updateBlockText(idx, e.target.value)}
                              className="w-full border border-[#D9D4C6] p-2.5 text-xs text-[#3A4239] focus:border-[#3F6B4F] focus:outline-none"
                              placeholder="Paragraph body text..."
                            />
                          ) : (
                            <div className="space-y-3">
                              {block.src ? (
                                <div className="relative max-h-48 overflow-hidden border border-[#D9D4C6] bg-[#1E2620]">
                                  <img
                                    src={block.src}
                                    alt={block.caption || `Section ${idx + 1}`}
                                    className={`max-h-48 w-full ${
                                      block.fitMode === "contain" ? "object-contain" : "object-cover"
                                    }`}
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-[#D9D4C6] bg-[#FAF9F5] p-4 text-center">
                                  <p className="text-xs text-[#8B9188]">No image selected for this block yet</p>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <label className="inline-flex cursor-pointer items-center gap-1.5 border border-[#3F6B4F]/40 bg-[#F1F5F1] px-3 py-1.5 text-[11px] font-semibold text-[#3F6B4F] transition hover:bg-[#3F6B4F] hover:text-white">
                                  <Upload size={13} /> Choose section image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSectionImageChange(idx, e.target.files?.[0])}
                                    className="hidden"
                                  />
                                </label>

                                <div className="flex items-center gap-1 text-xs">
                                  <span className="mr-1 text-[#8B9188]">Fit:</span>
                                  <button
                                    type="button"
                                    onClick={() => updateBlockFitMode(idx, "cover")}
                                    className={`border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                      block.fitMode === "cover"
                                        ? "border-[#1E2620] bg-[#1E2620] text-white"
                                        : "border-[#D9D4C6] bg-white text-[#5A6259]"
                                    }`}
                                  >
                                    Fill
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateBlockFitMode(idx, "contain")}
                                    className={`border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                      block.fitMode === "contain"
                                        ? "border-[#1E2620] bg-[#1E2620] text-white"
                                        : "border-[#D9D4C6] bg-white text-[#5A6259]"
                                    }`}
                                  >
                                    Fit whole
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) => updateBlockCaption(idx, e.target.value)}
                                placeholder="Image caption or source note (optional)..."
                                className="w-full border border-[#D9D4C6] p-2 text-xs text-[#3A4239] focus:border-[#3F6B4F] focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h1 className="text-2xl italic leading-snug text-[#1E2620]" style={displayFont}>
                      {editedTitle}
                    </h1>

                    {currentImgUrl && (
                      <div className="group relative flex max-h-[420px] items-center justify-center overflow-hidden border border-[#D9D4C6] bg-[#1E2620]">
                        <img
                          src={currentImgUrl}
                          alt={story.title}
                          className="max-h-[420px] w-full object-contain"
                        />
                        {isEditor && (
                          <button
                            type="button"
                            onClick={() => {
                              setPendingCropImageSrc(currentImgUrl);
                              setIsCropperOpen(true);
                            }}
                            className="absolute top-3 right-3 inline-flex items-center gap-1.5 border border-white/20 bg-[#1E2620]/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#1E2620]"
                          >
                            <Crop size={14} className="text-[#8FBF9F]" /> Recrop cover image
                          </button>
                        )}
                      </div>
                    )}

                    {editedExcerpt && (
                      <div className="border-l-2 border-[#D9D4C6] bg-[#FAF9F5] p-4 text-xs italic leading-relaxed text-[#3A4239]">
                        "{editedExcerpt}"
                      </div>
                    )}

                    <div className="space-y-5 pt-2">
                      {editedBlocks && editedBlocks.length > 0 ? (
                        editedBlocks.map((block: BlogBlock, idx: number) => {
                          if (block.type === "p" || !block.type) {
                            return (
                              <p key={idx} className="text-xs leading-relaxed text-[#3A4239] sm:text-sm">
                                {block.text}
                              </p>
                            );
                          }

                          if (block.type === "image" && (block.src || block.url)) {
                            return (
                              <div key={idx} className="my-4 space-y-2">
                                <div className="max-h-72 overflow-hidden border border-[#E2DDCF] bg-[#F3F2ED]">
                                  <img
                                    src={block.src || block.url}
                                    alt={block.caption || `Section ${idx + 1}`}
                                    className={`max-h-72 w-full ${
                                      block.fitMode === "contain"
                                        ? "bg-[#1E2620] object-contain"
                                        : "object-cover"
                                    }`}
                                  />
                                </div>
                                {block.caption && (
                                  <p className="text-center text-[11px] italic text-[#8B9188]">
                                    {block.caption}
                                  </p>
                                )}
                              </div>
                            );
                          }

                          return null;
                        })
                      ) : (
                        <p className="text-xs italic text-[#8B9188]">No section blocks found for this story.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {!isPublished && (
                  <div className="space-y-4 border border-[#E2DDCF] bg-[#FAF9F5] p-5">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
                      {isEditor ? "Editorial decision" : "Review approval panel"}
                    </h4>

                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase text-[#8B9188]">
                        <MessageSquare size={13} /> Notes / instructions
                      </label>
                      <textarea
                        rows={4}
                        value={revisionFeedbackNote}
                        onChange={(e) => setRevisionFeedbackNote(e.target.value)}
                        placeholder="Leave remarks or feedback for the author..."
                        className="w-full border border-[#D9D4C6] bg-white p-3 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision("approve")}
                        className="inline-flex w-full items-center justify-center gap-2 border border-[#3F6B4F] bg-[#3F6B4F] py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#345A42] disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        {isEditor
                          ? "Approve for publication"
                          : story.editorModifications
                          ? "Accept editor changes"
                          : "Approve story"}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision("reject")}
                        className="inline-flex w-full items-center justify-center gap-2 border border-[#B65C4B]/50 bg-white py-3 text-xs font-semibold uppercase tracking-wide text-[#B65C4B] transition hover:bg-[#FBEEEC] disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <XCircle size={15} />
                        )}
                        Request changes
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
                    <MessageSquare size={14} className="text-[#3F6B4F]" /> Internal notes ({comments.length})
                  </h4>

                  <form onSubmit={handlePostComment} className="space-y-2">
                    <textarea
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Add an internal note..."
                      className="w-full border border-[#D9D4C6] bg-white p-3 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isPostingComment || !newCommentText.trim()}
                      className="inline-flex w-full items-center justify-center gap-1.5 border border-[#1E2620] bg-[#1E2620] py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-50"
                    >
                      <Send size={12} /> {isPostingComment ? "Posting…" : "Post comment"}
                    </button>
                  </form>

                  <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
                    {comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="space-y-1 border border-[#EDEAE0] bg-white p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#1E2620]">
                            {comment.user
                              ? `${comment.user.firstName} ${comment.user.lastName}`
                              : "Reviewer"}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-[#8B9188]" style={monoFont}>
                            <Clock size={9} />
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A6259]">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {pendingCropImageSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={pendingCropImageSrc}
          aspectRatio={16 / 9}
          onClose={() => {
            setIsCropperOpen(false);
            setPendingCropImageSrc(null);
          }}
          onSave={handleCropSave}
        />
      )}
    </>,
    document.body
  );
}