'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  ShieldCheck,
  MessageCircle,
  Calendar,
} from "lucide-react";

// ── Typography & Fonts ─────────────────────────────────────────────
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

function formatPublishedLinks(text: string): string {
  if (!text) return '';

  const normalizeUrl = (url: string) => {
    let trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  // 1. Convert Markdown links [label](url) -> styled <a>
  let formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) =>
      `<a href="${normalizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="published-article-link">${label}</a>`
  );

  // 2. Convert rich text editor data-href spans
  formatted = formatted.replace(
    /<span class="editor-link" data-href="([^"]+)">([^<]+)<\/span>/g,
    (_, url, label) =>
      `<a href="${normalizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="published-article-link">${label}</a>`
  );

  // 3. Convert standard HTML <a> tags
  formatted = formatted.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (_, url, restAttrs, label) =>
      `<a href="${normalizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="published-article-link"${restAttrs}>${label}</a>`
  );

  return formatted;
}

const renderSocialPlatformIcon = (platformName: string) => {
  const p = platformName.toLowerCase();

  if (p.includes('x') || p.includes('twitter')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#1E2620] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#0A66C2] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#1877F2] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-[#E4405F] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 2.156 4.919 5.406.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 5.255-4.919 5.404-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-2.199-4.919-5.404-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-5.255 4.919-5.406 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  return <MessageCircle size={24} className="text-[#3F6B4F] transition-transform hover:scale-110" />;
};

interface ReviewStoryModalProps {
  story: BlogPost;
  currentUserRole: Role;
  onClose: () => void;
  onReviewCompleted: () => void;
}

export default function ReviewStoryModal({
  story: initialStory,
  currentUserRole,
  onClose,
  onReviewCompleted,
}: ReviewStoryModalProps) {
  const [story, setStory] = useState<BlogPost>(initialStory);
  const [isLoadingFullStory, setIsLoadingFullStory] = useState(true);

  const [revisionFeedbackNote, setRevisionFeedbackNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── Editable Content States ──────────────────────────────────────────────
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialStory.title || "");
  const [editedExcerpt, setEditedExcerpt] = useState(initialStory.excerpt || "");
  const [editedBlocks, setEditedBlocks] = useState<BlogBlock[]>([]);

  const [editedSectionFiles, setEditedSectionFiles] = useState<Record<number, File>>({});

  // ─── Cover Image & Cropping States ─────────────────────────────────────────
  const [currentImgUrl, setCurrentImgUrl] = useState<string>(initialStory.img || "");
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingCropImageSrc, setPendingCropImageSrc] = useState<string | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // ─── Discussion & Moderation States ─────────────────────────────────────────
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [activeCommentActionId, setActiveCommentActionId] = useState<string | null>(null);

  // ─── Portal mount guard ────────────────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userRoleStr = Array.isArray(currentUserRole) ? currentUserRole[0] : currentUserRole;
  const isEditor = userRoleStr === "editor";
  const isOfficer = userRoleStr === "communication_officer" || userRoleStr === "admin";
  const canModerateComments = ["admin", "editor", "communication_officer"].includes(userRoleStr);
  const isPublished = story.status === "published";

  useEffect(() => {
    let active = true;
    const fetchFullStory = async () => {
      if (!initialStory._id) return;
      setIsLoadingFullStory(true);
      try {
        const fullData = await blogsApi.getBlogById(initialStory._id, currentUserRole);
        if (active && fullData) {
          setStory(fullData);
          setEditedTitle(fullData.title || "");
          setEditedExcerpt(fullData.excerpt || "");
          setCurrentImgUrl(fullData.img || "");
          setEditedBlocks(
            fullData.blocks && fullData.blocks.length > 0
              ? fullData.blocks
              : [{ type: "p", text: "" }]
          );
        }
      } catch (err) {
        console.error("Failed to load full story payload:", err);
      } finally {
        if (active) setIsLoadingFullStory(false);
      }
    };

    fetchFullStory();
    return () => {
      active = false;
    };
  }, [initialStory._id, currentUserRole]);

  const creator = story.originalAuthor || story.author;
  const authorFullName = creator?.firstName
    ? `${creator.firstName} ${creator.lastName || ""}`.trim()
    : creator?.username || "BioCap Contributor";
  const authorJobTitle = creator?.jobTitle?.trim() || "";
  const authorDisplayByline = authorJobTitle
    ? `${authorFullName} (${authorJobTitle})`
    : authorFullName;

  const publishedLabel = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : story.createdAt
    ? new Date(story.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const fetchComments = useCallback(async () => {
    if (!story._id || !canModerateComments) return;
    try {
      const data = await officerApi.getArticleComments(story._id);
      setComments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err?.status === 403 || err?.response?.status === 403) {
        setComments([]);
        return;
      }
      console.error("Failed to fetch comments for story:", err);
    }
  }, [story._id, canModerateComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleToggleHideComment = async (commentId: string, currentIsVisible?: boolean) => {
    setActiveCommentActionId(commentId);
    try {
      if (currentIsVisible === false) {
        await blogsApi.unhideBlogComment(story._id, commentId);
      } else {
        await blogsApi.hideBlogComment(story._id, commentId);
      }
      await fetchComments();
    } catch (err: any) {
      alert(err.message || "Moderation action failed.");
    } finally {
      setActiveCommentActionId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;

    setActiveCommentActionId(commentId);
    try {
      await blogsApi.deleteBlogComment(story._id, commentId);
      await fetchComments();
    } catch (err: any) {
      alert(err.message || "Failed to delete comment.");
    } finally {
      setActiveCommentActionId(null);
    }
  };

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

  const isFilteredOrgLink =
    story.organizationLink &&
    !story.organizationLink.includes('realgreengoldltd.com');

  if (!isMounted) return null;

  return createPortal(
    <>
      <style>{`
        .published-article-link, .published-article-link * {
          color: #0057FF !important;
          text-decoration: underline !important;
          text-decoration-color: #0057FF !important;
          text-underline-offset: 2px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
        }
        .published-article-link:hover {
          color: #003DB8 !important;
        }
      `}</style>

      <div
        className={`${fontVars} fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E2620]/40 p-4 backdrop-blur-md animate-in fade-in duration-150`}
        style={bodyFont}
      >
        <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden border border-[#D9D4C6] bg-[#FDFCFA] shadow-2xl">
          <input
            type="file"
            ref={coverFileInputRef}
            onChange={handleCoverFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Modal header */}
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
              className="border border-transparent p-2 text-[#8B9188] transition-colors hover:border-[#D9D4C6] hover:text-[#1E2620] cursor-pointer"
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
                {/* Story metadata bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEAE0] pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-[#C22055] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                    >
                      <Tag size={11} /> {story.tag || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1B3A5C]">
                      <UserIcon size={12} className="text-[#1B3A5C]" /> By {authorDisplayByline}
                    </span>
                    {publishedLabel && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#6B7268]">
                        <Calendar size={12} className="text-[#8B9188]" /> {publishedLabel}
                      </span>
                    )}
                  </div>

                  {isEditor && !isPublished && (
                    <button
                      type="button"
                      onClick={() => setIsEditingContent(!isEditingContent)}
                      className="inline-flex items-center gap-1.5 border border-[#3F6B4F]/40 bg-[#F1F5F1] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#3F6B4F] transition-colors hover:bg-[#3F6B4F] hover:text-white cursor-pointer"
                    >
                      {isEditingContent ? (
                        <>
                          <Eye size={13} /> Preview Mode
                        </>
                      ) : (
                        <>
                          <Edit3 size={13} /> Edit Story Content
                        </>
                      )}
                    </button>
                  )}
                </div>

                {(story.socialHandle || story.organizationLink || story.document || story.documentUrl) && (
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
                    {(story.document || story.documentUrl) && (
                      <a
                        href={story.documentUrl || story.document}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#4A6E8A] hover:underline"
                      >
                        <FileText size={13} /> {story.documentName || "Download Attachment PDF"}
                      </a>
                    )}
                  </div>
                )}

                {/* Loading skeleton */}
                {isLoadingFullStory ? (
                  <div className="space-y-4 animate-pulse py-6">
                    <div className="h-6 w-3/4 bg-slate-100 rounded" />
                    <div className="h-48 w-full bg-slate-100 rounded-xl" />
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-5/6 bg-slate-100 rounded" />
                  </div>
                ) : isEditingContent ? (
                  <div className="space-y-5 border border-[#3F6B4F]/25 bg-[#F1F5F1] p-5">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#2F4F3B]">
                        Story Headline
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
                        Excerpt / Summary
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
                        Cover Image
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
                              className="inline-flex items-center gap-1.5 border border-white/20 bg-[#1E2620]/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#1E2620] cursor-pointer"
                            >
                              <Crop size={13} className="text-[#8FBF9F]" /> Recrop
                            </button>

                            <button
                              type="button"
                              onClick={() => coverFileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 border border-[#3F6B4F] bg-[#3F6B4F]/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition hover:bg-[#3F6B4F] cursor-pointer"
                            >
                              <Upload size={13} /> Change Cover
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center border-2 border-dashed border-[#3F6B4F]/40 bg-white p-6 text-[#3F6B4F] transition hover:bg-[#F1F5F1] cursor-pointer"
                        >
                          <Upload size={22} strokeWidth={1.5} className="mb-1" />
                          <span className="text-xs font-semibold">Upload Cover Image</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 border-t border-[#3F6B4F]/20 pt-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#2F4F3B]">
                          Story Body Sections ({editedBlocks.length})
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={addTextBlock}
                            className="inline-flex items-center gap-1 border border-[#3F6B4F]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#3F6B4F] hover:bg-[#F1F5F1] cursor-pointer"
                          >
                            <Plus size={13} /> Paragraph
                          </button>
                          <button
                            type="button"
                            onClick={addImageBlock}
                            className="inline-flex items-center gap-1 border border-[#3F6B4F]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#3F6B4F] hover:bg-[#F1F5F1] cursor-pointer"
                          >
                            <ImageIcon size={13} /> Inline Photo
                          </button>
                        </div>
                      </div>

                      {editedBlocks.map((block, idx) => (
                        <div key={idx} className="relative space-y-3 border border-[#E2DDCF] bg-white p-3.5">
                          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-[#8B9188]">
                            <span>Section #{idx + 1} ({block.type === "image" ? "Inline Image" : "Paragraph"})</span>
                            {editedBlocks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBlock(idx)}
                                className="p-1 text-[#B65C4B] hover:text-[#8A3A2C] cursor-pointer"
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
                                  <Upload size={13} /> Choose Section Image
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
                                    className={`border px-2 py-0.5 text-[10px] font-semibold uppercase cursor-pointer ${
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
                                    className={`border px-2 py-0.5 text-[10px] font-semibold uppercase cursor-pointer ${
                                      block.fitMode === "contain"
                                        ? "border-[#1E2620] bg-[#1E2620] text-white"
                                        : "border-[#D9D4C6] bg-white text-[#5A6259]"
                                    }`}
                                  >
                                    Fit Whole
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
                  <div className="space-y-6 text-[#334155]">
                    <h1 className="art-serif text-3xl font-bold italic leading-tight text-[#1B3A5C] sm:text-4xl" style={displayFont}>
                      {editedTitle}
                    </h1>

                    {currentImgUrl && (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#0f2240]">
                        <img
                          src={currentImgUrl}
                          alt={story.title}
                          className="max-h-[420px] w-full object-cover"
                        />
                      </div>
                    )}

                    {/* 🟢 FIXED: Excerpt rendering with link formatting */}
                    {editedExcerpt && (
                      <div
                        className="border-l-[3px] border-[#C22055] bg-slate-50 p-4 text-sm italic leading-relaxed text-slate-700"
                        dangerouslySetInnerHTML={{
                          __html: `"${formatPublishedLinks(editedExcerpt.trim())}"`,
                        }}
                      />
                    )}

                    {/* FULL ARTICLE BODY BLOCKS OR HTML RENDER */}
                    <div className="space-y-6 pt-2">
                      {editedBlocks && editedBlocks.length > 0 ? (
                        editedBlocks.map((block: BlogBlock, idx: number) => {
                          if (block.type === 'h2') {
                            return (
                              <h2 key={idx} className="text-xl font-bold text-[#1B3A5C] mt-6 mb-2">
                                {block.text}
                              </h2>
                            );
                          }

                          {/* 🟢 FIXED: Quote block rendering with link formatting */}
                          if (block.type === 'quote') {
                            return (
                              <blockquote
                                key={idx}
                                className="border-l-[3px] border-[#C22055] pl-4 py-1 my-4 italic text-slate-700 text-sm leading-relaxed"
                              >
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: formatPublishedLinks(block.text || ''),
                                  }}
                                />
                                {block.caption && (
                                  <footer className="mt-1 not-italic text-[10px] font-bold uppercase tracking-widest text-[#C22055]">
                                    — {block.caption}
                                  </footer>
                                )}
                              </blockquote>
                            );
                          }

                          if (block.type === 'image' && (block.src || block.url)) {
                            return (
                              <figure key={idx} className="my-6 space-y-2">
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 max-h-96">
                                  <img
                                    src={block.src || block.url}
                                    alt={block.caption || `Section ${idx + 1}`}
                                    className={`w-full max-h-96 ${
                                      block.fitMode === 'contain' ? 'object-contain bg-slate-950' : 'object-cover'
                                    }`}
                                  />
                                </div>
                                {block.caption && (
                                  <figcaption className="text-center text-xs font-medium text-slate-500 italic">
                                    {block.caption}
                                  </figcaption>
                                )}
                              </figure>
                            );
                          }

                          return (
                            <div key={idx}>
                              {(block.text || '')
                                .split(/\n+/)
                                .map((paragraphText, pIdx) => (
                                  <p
                                    key={pIdx}
                                    className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify mb-3"
                                    dangerouslySetInnerHTML={{
                                      __html: formatPublishedLinks(paragraphText.trim()),
                                    }}
                                  />
                                ))}
                            </div>
                          );
                        })
                      ) : story.bodyHtml ? (
                        <div
                          className="prose text-xs sm:text-sm leading-relaxed text-slate-700"
                          dangerouslySetInnerHTML={{ __html: formatPublishedLinks(story.bodyHtml) }}
                        />
                      ) : (
                        <p className="text-xs italic text-[#8B9188]">No article content body available.</p>
                      )}
                    </div>

                    {/* Standalone Author Handles & PDF Links */}
                    {(() => {
                      const blogHandle = story.socialHandle?.trim();
                      const authorHandle = story.originalAuthor?.socialHandle?.trim() || story.author?.socialHandle?.trim();

                      const isDefaultHandle = !blogHandle || blogHandle.toLowerCase() === "@biocap" || blogHandle.toLowerCase() === "biocap";
                      const rawSocialHandle = isDefaultHandle && authorHandle ? authorHandle : (blogHandle || authorHandle || "");

                      if (!rawSocialHandle && !isFilteredOrgLink && !story.document && !story.documentUrl) {
                        return null;
                      }

                      return (
                        <div className="mt-8 pt-4 border-t border-slate-100">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#C22055]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B3A5C]">
                              Author Social Links &amp; Credentials
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-5">
                            {rawSocialHandle.length > 0 &&
                              rawSocialHandle.split(' | ').map((handleEntry: string, idx: number) => {
                                const parts = handleEntry.split(': ');
                                const platform = parts.length > 1 ? parts[0] : 'Social';
                                const handleValue = parts.length > 1 ? parts.slice(1).join(': ') : handleEntry;

                                let targetUrl = handleValue;
                                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                                  if (platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x')) {
                                    targetUrl = `https://x.com/${handleValue.replace('@', '')}`;
                                  } else if (platform.toLowerCase().includes('linkedin')) {
                                    targetUrl = `https://linkedin.com/in/${handleValue}`;
                                  } else if (platform.toLowerCase().includes('facebook')) {
                                    targetUrl = `https://facebook.com/${handleValue}`;
                                  } else if (platform.toLowerCase().includes('instagram')) {
                                    targetUrl = `https://instagram.com/${handleValue.replace('@', '')}`;
                                  } else {
                                    targetUrl = `https://${handleValue}`;
                                  }
                                }

                                return (
                                  <a
                                    key={idx}
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={`${platform}: ${handleValue}`}
                                    className="group relative inline-flex items-center justify-center cursor-pointer"
                                  >
                                    {renderSocialPlatformIcon(platform)}
                                  </a>
                                );
                              })}

                            {isFilteredOrgLink && (
                              <a
                                href={story.organizationLink}
                                target="_blank"
                                rel="noreferrer"
                                title={`Organization: ${story.organizationLink}`}
                                className="inline-flex items-center justify-center text-[#1B3A5C] hover:text-[#C22055] transition-transform hover:scale-110"
                              >
                                <Globe size={24} />
                              </a>
                            )}

                            {(story.document || story.documentUrl) && (
                              <a
                                href={story.documentUrl || story.document}
                                target="_blank"
                                rel="noreferrer"
                                title={story.documentName || 'Download Document PDF'}
                                className="inline-flex items-center justify-center text-[#2F8F5B] hover:text-[#C22055] transition-transform hover:scale-110"
                              >
                                <FileText size={24} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Sidebar: Decision & Moderated Comments */}
              <div className="space-y-6">
                {!isPublished && (
                  <div className="space-y-4 border border-[#E2DDCF] bg-[#FAF9F5] p-5">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
                      {isEditor ? "Editorial Decision" : "Review Approval Panel"}
                    </h4>

                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase text-[#8B9188]">
                        <MessageSquare size={13} /> Notes / Instructions
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
                        className="inline-flex w-full items-center justify-center gap-2 border border-[#3F6B4F] bg-[#3F6B4F] py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#345A42] disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        {isEditor
                          ? "Approve for Publication"
                          : story.editorModifications
                          ? "Accept Editor Changes"
                          : "Approve Story"}
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecision("reject")}
                        className="inline-flex w-full items-center justify-center gap-2 border border-[#B65C4B]/50 bg-white py-3 text-xs font-semibold uppercase tracking-wide text-[#B65C4B] transition hover:bg-[#FBEEEC] disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <XCircle size={15} />
                        )}
                        Request Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Moderated Discussion Comments Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
                      <MessageSquare size={14} className="text-[#3F6B4F]" /> Internal Notes ({comments.length})
                    </h4>
                    {canModerateComments && (
                      <span className="inline-flex items-center gap-1 border border-[#3F6B4F]/30 bg-[#3F6B4F]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#3F6B4F]" style={monoFont}>
                        <ShieldCheck size={11} /> Moderator
                      </span>
                    )}
                  </div>

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
                      className="inline-flex w-full items-center justify-center gap-1.5 border border-[#1E2620] bg-[#1E2620] py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-50 cursor-pointer"
                    >
                      <Send size={12} /> {isPostingComment ? "Posting…" : "Post Comment"}
                    </button>
                  </form>

                  <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <p className="py-4 text-center text-xs italic text-[#8B9188]">No discussion notes posted yet.</p>
                    ) : (
                      comments.map((comment: any) => {
                        const isHidden = comment.isVisible === false;
                        const isBusy = activeCommentActionId === comment._id;

                        return (
                          <div
                            key={comment._id}
                            className={`space-y-1.5 border p-3 transition-colors ${
                              isHidden ? "border-amber-300 bg-amber-50/50" : "border-[#EDEAE0] bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-[#1E2620]">
                                  {comment.name || (comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : "Guest Author")}
                                </span>
                                {isHidden && (
                                  <span className="border border-amber-400 bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-800" style={monoFont}>
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <span className="flex items-center gap-1 text-[9px] text-[#8B9188]" style={monoFont}>
                                <Clock size={9} />
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Recently"}
                              </span>
                            </div>

                            <p className={`text-xs leading-relaxed ${isHidden ? "text-amber-900/70 italic" : "text-[#5A6259]"}`}>
                              {comment.content}
                            </p>

                            {canModerateComments && (
                              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EDEAE0]">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleToggleHideComment(comment._id, comment.isVisible)}
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-colors ${
                                    isHidden ? "text-emerald-700 hover:text-emerald-900" : "text-amber-700 hover:text-amber-900"
                                  }`}
                                >
                                  {isBusy ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : isHidden ? (
                                    <>
                                      <Eye size={11} /> Unhide
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={11} /> Hide
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-rose-600 hover:text-rose-800 cursor-pointer transition-colors"
                                >
                                  {isBusy ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
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