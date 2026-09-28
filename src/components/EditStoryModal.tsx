'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { BlogPost, Role, BlogBlock, ChangeRequest } from "@/types";
import { blogsApi } from "@/lib/api/blogs";
import CommentManager from "@/components/CommentManager";
import ImageCropperModal from "@/components/ImageCropperModal";
import { base64ToFile } from "@/lib/utils/file";
import {
  X,
  Save,
  Upload,
  Loader2,
  AlertCircle,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Crop,
  Plus,
  Trash2,
  ImageIcon,
  Tag,
  Calendar,
  AtSign,
  Globe,
  MessageCircle,
  Edit3,
  Eye,
  Link as LinkIcon,
  Bold as BoldIcon,
  Highlighter,
} from "lucide-react";

// ── Editorial Type & Styling System ──────────────────────────────────────────
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

// Helper to convert Markdown and HTML links into interactive publication elements.
// NOTE: this function is idempotent — running it on its own output changes nothing.
function formatPublishedLinks(text: string): string {
  if (!text) return '';

  const normalizeUrl = (url: string) => {
    let trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  let formatted = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => {
      const cleanUrl = normalizeUrl(url);
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}" class="published-article-link">${label}</a>`;
    }
  );

  formatted = formatted.replace(
    /<span class="editor-link" data-href="([^"]+)">([^<]+)<\/span>/g,
    (_, url, label) => {
      const cleanUrl = normalizeUrl(url);
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}" class="published-article-link">${label}</a>`;
    }
  );

  formatted = formatted.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, url, _restAttrs, label) => {
      // Already normalised → leave it alone. Without this, every pass re-added
      // target/rel/title/class, so the string changed on every call.
      if (match.includes('published-article-link')) return match;

      const cleanUrl = normalizeUrl(url);
      const cleanLabel = label.replace(/^🔗\s*/, '');
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}" class="published-article-link">${cleanLabel}</a>`;
    }
  );

  return formatted;
}

// Finds the editable paragraph (rendered by EditableParagraph) that contains a node
function findParagraph(node: Node | null): HTMLElement | null {
  const el = node instanceof Element ? node : (node?.parentElement ?? null);
  return (el?.closest('[data-block-idx]') as HTMLElement | null) ?? null;
}

// ── EditableParagraph ────────────────────────────────────────────────────────
// A contentEditable paragraph that the BROWSER owns while the user edits.
//
// Why not dangerouslySetInnerHTML? React rewrites innerHTML whenever the string
// changes, which destroys every text node and collapses any live Selection/Range
// to the start of the paragraph (→ duplicated words at the start). Here we only
// write to the DOM when it is genuinely out of date (first load, a block being
// removed/reordered), never when it already matches — so selection and caret
// survive formatting actions.

// useLayoutEffect on the client, useEffect during SSR (avoids the SSR warning)
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Browsers leave a lone <br> in an emptied contentEditable; treat it as empty.
const readHtml = (el: HTMLElement) => (el.innerHTML === "<br>" ? "" : el.innerHTML);

interface EditableParagraphProps {
  index: number;
  html: string;
  onCommit: (index: number, html: string) => void;
}

function EditableParagraph({ index, html, onCommit }: EditableParagraphProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (el && readHtml(el) !== html) {
      el.innerHTML = html;
    }
  }, [html]);

  return (
    <p
      ref={ref}
      data-block-idx={index}
      data-placeholder="Click to write paragraph content..."
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onCommit(index, readHtml(e.currentTarget))}
      title="Highlight text to open format toolbar (Link, Bold, Highlight)"
      className="text-xs sm:text-sm text-[#3A4239] leading-relaxed text-justify p-2 border border-transparent hover:border-dashed hover:border-[#3F6B4F] focus:border-solid focus:border-[#3F6B4F] focus:bg-[#FAF9F5] focus:outline-none rounded transition-all cursor-text mb-3"
    />
  );
}

const renderSocialPlatformIcon = (platformName: string) => {
  const p = platformName.toLowerCase();

  if (p.includes('x') || p.includes('twitter')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-[#1E2620] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-[#0A66C2] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-[#1877F2] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-[#E4405F] transition-transform hover:scale-110 hover:fill-[#C22055]">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 2.156 4.919 5.406.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 5.255-4.919 5.404-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-2.199-4.919-5.404-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-5.255 4.919-5.406 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  return <MessageCircle size={20} className="text-[#3F6B4F]" />;
};

export interface EditStoryModalProps {
  story: BlogPost;
  currentUserRole: Role;
  onClose: () => void;
  onStoryUpdated: () => void;
}

export default function EditStoryModal({
  story: initialStory,
  currentUserRole,
  onClose,
  onStoryUpdated,
}: EditStoryModalProps) {
  const [localStory, setLocalStory] = useState<BlogPost>(initialStory);
  const [isLoadingFullStory, setIsLoadingFullStory] = useState(true);

  const [articleTitle, setArticleTitle] = useState(initialStory.title || "");
  const [articleTag, setArticleTag] = useState(initialStory.tag || "General");
  const [articleExcerpt, setArticleExcerpt] = useState(initialStory.excerpt || "");

  const [isEditingContent, setIsEditingContent] = useState(false);

  // Floating Selection Action Bar & Selection Range State
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const activeParagraphElRef = useRef<HTMLElement | null>(null);

  // Manuscript Engine Blocks State
  const [editedBlocks, setEditedBlocks] = useState<BlogBlock[]>([]);
  const [editedSectionFiles, setEditedSectionFiles] = useState<Record<number, File>>({});

  // Cover Image States
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string>(initialStory.img || "");
  const [croppedCoverFile, setCroppedCoverFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingCropSrc, setPendingCropImageSrc] = useState<string | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editorFeedbackNote = localStory.lastRejectionNote || null;

  // Revision Requests State
  const [implementingChange, setImplementingChange] = useState<ChangeRequest | null>(null);
  const [implementationNote, setImplementationNote] = useState("");
  const [isImplementing, setIsImplementing] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchFullStory = async () => {
      if (!initialStory._id) return;
      setIsLoadingFullStory(true);
      try {
        const fullData = await blogsApi.getBlogById(initialStory._id, currentUserRole);
        if (active && fullData) {
          setLocalStory(fullData);
          setArticleTitle(fullData.title || "");
          setArticleTag(fullData.tag || "General");
          setArticleExcerpt(fullData.excerpt || "");
          setCurrentCoverUrl(fullData.img || "");

          const rawBlocks: BlogBlock[] =
            fullData.blocks && fullData.blocks.length > 0
              ? fullData.blocks
              : [{ type: "p", text: (fullData as any).content || fullData.bodyHtml || "" }];

          // Normalise links ONCE at load time so the DOM and state never disagree later
          setEditedBlocks(
            rawBlocks.map((b) =>
              b.type === "image" ? b : { ...b, text: formatPublishedLinks(b.text || "") }
            )
          );
        }
      } catch (err) {
        console.error("Failed to load full author story payload:", err);
      } finally {
        if (active) setIsLoadingFullStory(false);
      }
    };

    fetchFullStory();
    return () => {
      active = false;
    };
  }, [initialStory._id, currentUserRole]);

  // ── Floating format toolbar ────────────────────────────────────────────────
  const hideToolbar = useCallback(() => {
    setToolbarPos(null);
    savedRangeRef.current = null;
    activeParagraphElRef.current = null;
  }, []);

  const syncToolbarWithSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      hideToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    const startP = findParagraph(range.startContainer);
    const endP = findParagraph(range.endContainer);

    // Only allow formatting when the whole selection sits inside ONE paragraph
    if (!startP || startP !== endP || !range.toString().trim()) {
      hideToolbar();
      return;
    }

    savedRangeRef.current = range.cloneRange();
    activeParagraphElRef.current = startP;

    const rect = range.getBoundingClientRect();
    setToolbarPos({
      top: Math.max(8, rect.top - 52),
      left: Math.min(Math.max(8, rect.left + rect.width / 2 - 80), window.innerWidth - 180),
    });
  }, [hideToolbar]);

  // Listen to real selection changes instead of mouseup/keyup on each <p>
  useEffect(() => {
    if (isEditingContent || isLoadingFullStory) return;

    document.addEventListener('selectionchange', syncToolbarWithSelection);
    window.addEventListener('scroll', syncToolbarWithSelection, true);
    window.addEventListener('resize', syncToolbarWithSelection);
    return () => {
      document.removeEventListener('selectionchange', syncToolbarWithSelection);
      window.removeEventListener('scroll', syncToolbarWithSelection, true);
      window.removeEventListener('resize', syncToolbarWithSelection);
      hideToolbar();
    };
  }, [isEditingContent, isLoadingFullStory, syncToolbarWithSelection, hideToolbar]);

  // 🟢 APPLY FORMATTING IN PLACE — no duplication, no jumping to the start
  const applyTextAction = (type: 'link' | 'bold' | 'highlight') => {
    const range = savedRangeRef.current;
    const paragraph = activeParagraphElRef.current;
    if (!range || !paragraph || !paragraph.isConnected) return;

    let wrapper: HTMLElement;

    if (type === 'link') {
      const url = window.prompt("Enter destination URL for selected text:", "https://");
      if (!url || !url.trim() || url.trim() === 'https://') return;
      const trimmed = url.trim();
      const formattedUrl = /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;

      // The prompt can steal focus — make sure the saved range is still valid
      if (!paragraph.isConnected || !paragraph.contains(range.commonAncestorContainer)) return;

      // Selection already lives inside a link → just change that link's URL
      const container = range.commonAncestorContainer;
      const existingLink = (container instanceof Element ? container : container.parentElement)
        ?.closest('a') as HTMLAnchorElement | null;
      if (existingLink && paragraph.contains(existingLink)) {
        existingLink.href = formattedUrl;
        existingLink.title = formattedUrl;
        const linkIdx = Number(paragraph.dataset.blockIdx);
        if (!Number.isNaN(linkIdx)) updateBlockText(linkIdx, paragraph.innerHTML);
        hideToolbar();
        return;
      }

      const link = document.createElement('a');
      link.href = formattedUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = formattedUrl;
      link.className = 'published-article-link';
      wrapper = link;
    } else if (type === 'bold') {
      const strong = document.createElement('strong');
      strong.style.fontWeight = 'bold';
      wrapper = strong;
    } else {
      const mark = document.createElement('mark');
      mark.style.backgroundColor = '#FEF08A';
      mark.style.color = '#1E2620';
      mark.style.padding = '0 3px';
      mark.style.borderRadius = '2px';
      wrapper = mark;
    }

    // MOVE the selected nodes into the wrapper (keeps any existing formatting),
    // then drop the wrapper back exactly where the selection was.
    const fragment = range.extractContents();
    if (type === 'link') {
      // <a> inside <a> is invalid HTML and gets split by the parser
      fragment.querySelectorAll('a').forEach((a) => a.replaceWith(...Array.from(a.childNodes)));
    }
    wrapper.appendChild(fragment);
    range.insertNode(wrapper);
    paragraph.normalize();

    // Sync React state FROM the DOM. Because EditableParagraph only writes to the
    // DOM when it differs from state, nothing gets rewritten and nothing moves.
    const idx = Number(paragraph.dataset.blockIdx);
    if (!Number.isNaN(idx)) updateBlockText(idx, paragraph.innerHTML);

    // Put the caret right after the formatted text
    const selection = window.getSelection();
    if (selection) {
      const caret = document.createRange();
      caret.setStartAfter(wrapper);
      caret.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caret);
    }

    hideToolbar();
  };

  const creator = localStory.originalAuthor || localStory.author;
  const authorFullName = creator?.firstName
    ? `${creator.firstName} ${creator.lastName || ""}`.trim()
    : creator?.username || "BioCap Contributor";
  const authorJobTitle = creator?.jobTitle?.trim() || "";
  const authorDisplayByline = authorJobTitle
    ? `${authorFullName} (${authorJobTitle})`
    : authorFullName;

  const publishedLabel = localStory.publishedAt
    ? new Date(localStory.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : localStory.createdAt
    ? new Date(localStory.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

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
    setCurrentCoverUrl(croppedBase64);
    const file = base64ToFile(croppedBase64, `cover-edited-${localStory._id}.jpg`);
    setCroppedCoverFile(file);
    setIsCropperOpen(false);
    setPendingCropImageSrc(null);
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

  const handleUpdateStory = async (e: React.FormEvent, submitForReview = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, any> = {
        title: articleTitle,
        tag: articleTag,
        excerpt: articleExcerpt,
        blocks: JSON.stringify(editedBlocks),
      };

      if (croppedCoverFile) {
        payload.img = croppedCoverFile;
      }

      const newInlineFiles = Object.values(editedSectionFiles);
      if (newInlineFiles.length > 0) {
        payload.images = newInlineFiles;
      }

      await blogsApi.updateBlog(localStory._id, payload, currentUserRole);

      if (submitForReview) {
        await blogsApi.submitBlog(localStory._id, currentUserRole);
      }

      setIsSubmitting(false);
      onStoryUpdated();
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update story:", error);
      const msg = error instanceof Error ? error.message : "Failed to save story changes.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const openImplementModal = (cr: ChangeRequest) => {
    setImplementingChange(cr);
    setImplementationNote(cr.implementationNote || "");
  };

  const handleConfirmImplement = async () => {
    if (!implementingChange || !implementingChange._id) return;
    setIsImplementing(true);
    try {
      await blogsApi.markChangeImplemented(
        localStory._id,
        {
          changeId: implementingChange._id,
          implementationNote: implementationNote || undefined,
        },
        currentUserRole
      );

      setLocalStory((prev) => {
        if (!prev.changeRequests) return prev;
        const updatedRequests = prev.changeRequests.map((cr) => {
          if (cr._id === implementingChange._id) {
            return {
              ...cr,
              implemented: true,
              implementedAt: new Date().toISOString(),
              implementationNote: implementationNote || cr.implementationNote,
            };
          }
          return cr;
        });
        return { ...prev, changeRequests: updatedRequests };
      });

      onStoryUpdated();
      setImplementingChange(null);
      setImplementationNote("");
    } catch (err) {
      console.error("Failed to mark change implemented:", err);
      alert("Failed to mark change implemented.");
    } finally {
      setIsImplementing(false);
    }
  };

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  const inputCls =
    "w-full border border-[#D9D4C6] bg-white px-3.5 py-2.5 text-xs text-[#1E2620] placeholder:text-[#8B9188] transition-colors focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15";
  const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#1E2620]";

  const btnBase =
    "inline-flex items-center gap-1.5 border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
  const btnNeutral = `${btnBase} border-[#D9D4C6] bg-white text-[#3A4239] hover:border-[#1E2620] hover:text-[#1E2620]`;
  const btnMoss = `${btnBase} border-[#3F6B4F] bg-[#3F6B4F] text-white hover:bg-[#345A42]`;
  const btnGold = `${btnBase} border-[#A9812F] bg-[#A9812F] text-white hover:bg-[#8C6721]`;

  const openChangeRequests = localStory.changeRequests
    ? localStory.changeRequests.filter((c) => !c.implemented)
    : [];

  const isFilteredOrgLink =
    localStory.organizationLink &&
    !localStory.organizationLink.includes('realgreengoldltd.com');

  return (
    <div
      className={`${fontVars} fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6`}
      style={bodyFont}
    >
      <style>{`
        /* Hyperlink Display Styling */
        .published-article-link,
        .published-article-link *,
        a.published-article-link,
        a.published-article-link * {
          color: #0057FF !important;
          text-decoration: underline !important;
          text-decoration-color: #0057FF !important;
          text-underline-offset: 2px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          display: inline !important;
        }
        .published-article-link:hover,
        .published-article-link *:hover {
          color: #003DB8 !important;
          text-decoration-color: #003DB8 !important;
        }

        /* Placeholder for empty editable paragraphs (kept out of the real content) */
        [data-block-idx]:empty::before {
          content: attr(data-placeholder);
          color: #8B9188;
          font-style: italic;
          pointer-events: none;
        }
      `}</style>

      {/* Floating Formatting Bubble Toolbar on Selection */}
      {toolbarPos && (
        <div
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
          // Keeps the text selected while the toolbar is clicked
          onMouseDown={(e) => e.preventDefault()}
          className="fixed z-[100000] flex items-center gap-1 bg-[#1E2620] text-white p-1.5 rounded-lg shadow-2xl animate-in fade-in duration-100 border border-white/20"
        >
          <button
            type="button"
            onClick={() => applyTextAction('link')}
            title="Insert Hyperlink"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold hover:bg-[#3F6B4F] rounded cursor-pointer transition-colors"
          >
            <LinkIcon size={12} /> Link
          </button>
          <div className="w-[1px] h-3 bg-white/20" />
          <button
            type="button"
            onClick={() => applyTextAction('bold')}
            title="Make Text Bold"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold hover:bg-[#3F6B4F] rounded cursor-pointer transition-colors"
          >
            <BoldIcon size={12} /> Bold
          </button>
          <div className="w-[1px] h-3 bg-white/20" />
          <button
            type="button"
            onClick={() => applyTextAction('highlight')}
            title="Highlight Text"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold hover:bg-[#3F6B4F] rounded cursor-pointer transition-colors"
          >
            <Highlighter size={12} /> Highlight
          </button>
        </div>
      )}

      <input
        type="file"
        ref={coverFileInputRef}
        onChange={handleCoverFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden border border-[#D9D4C6] bg-white shadow-2xl rounded-sm">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2DDCF] bg-[#F7F6F2] px-6 py-4">
          <div>
            <p
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3F6B4F]"
              style={monoFont}
            >
              <FileText size={13} /> Manuscript Workspace
            </p>
            <h3 className="mt-0.5 text-xl font-bold italic text-[#1E2620]" style={displayFont}>
              {isEditingContent ? "Structured Section Editor" : "Interactive Manuscript Mode"}
            </h3>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close"
            className="border border-[#D9D4C6] bg-white p-1.5 text-[#1E2620] transition-colors hover:bg-[#1E2620] hover:text-white cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8 bg-white">
          
          {/* Metadata Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEAE0] pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-[#C22055] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <Tag size={11} /> {articleTag || "General"}
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

            {!isLoadingFullStory && (
              <button
                type="button"
                onClick={() => setIsEditingContent((v) => !v)}
                className="inline-flex items-center gap-1.5 border border-[#3F6B4F]/40 bg-[#F1F5F1] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#3F6B4F] transition-colors hover:bg-[#3F6B4F] hover:text-white cursor-pointer"
              >
                {isEditingContent ? (
                  <>
                    <Eye size={13} /> Interactive Preview
                  </>
                ) : (
                  <>
                    <Edit3 size={13} /> Edit Section Blocks
                  </>
                )}
              </button>
            )}
          </div>

          {/* Editor Feedback Banner */}
          {editorFeedbackNote && (
            <div className="border-l-4 border-amber-600 bg-amber-50 p-4 shadow-xs rounded-r">
              <div
                className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900"
                style={monoFont}
              >
                <MessageSquare size={14} className="text-amber-700" /> Editor Feedback &amp; Revision Request
              </div>
              <p className="text-xs font-semibold leading-relaxed text-amber-950">{editorFeedbackNote}</p>
            </div>
          )}

          {/* Change Requests Section */}
          {openChangeRequests.length > 0 && (
            <div className="border border-[#E2DDCF] bg-white rounded-sm">
              <div className="flex items-center justify-between border-b border-[#EDEAE0] px-5 py-3 bg-[#FAF9F5]">
                <p
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1E2620]"
                  style={monoFont}
                >
                  <FileText size={12} /> Requested Revisions ({openChangeRequests.length})
                </p>
                <span
                  className="border border-[#B65C4B] bg-[#B65C4B] px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                  style={monoFont}
                >
                  Action Required
                </span>
              </div>

              <div className="divide-y divide-[#EDEAE0]">
                {openChangeRequests.map((cr, idx) => {
                  const commenterObj = cr.commenter as any;
                  const commenterName =
                    typeof cr.commenter === "string"
                      ? cr.commenter
                      : commenterObj?.firstName
                      ? `${commenterObj.firstName} ${commenterObj.lastName || ""}`.trim()
                      : commenterObj?.username || "Reviewer";

                  return (
                    <div
                      key={cr._id || idx}
                      className="p-4 bg-rose-50/20"
                      style={{ boxShadow: `inset 4px 0 0 #B65C4B` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#E2DDCF] bg-white text-[#1E2620]">
                            <UserIcon size={13} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1E2620]">
                              {commenterName}
                              {cr.role && (
                                <span className="ml-1 font-semibold text-[#5A6259]"> — {cr.role}</span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-[#5A6259]" style={monoFont}>
                              <Clock size={11} /> {cr.requestedAt ? new Date(cr.requestedAt).toLocaleString() : "Recently"}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openImplementModal(cr)}
                          className={`${btnGold} shrink-0 px-2.5 py-1`}
                        >
                          Mark implemented
                        </button>
                      </div>

                      <p className="mt-2.5 text-xs font-medium leading-relaxed text-[#1E2620]">{cr.comment}</p>
                    </div>
                  );
                })}
              </div>

              {/* Implement Modal Form */}
              {implementingChange && (
                <div className="border-t border-[#EDEAE0] bg-[#FAF9F5] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-[#1E2620]">Confirm Revision Implemented</p>
                    <button
                      type="button"
                      onClick={() => setImplementingChange(null)}
                      className="text-[11px] font-semibold text-[#5A6259] hover:text-[#1E2620] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className={labelCls}>Implementation note / author remark (optional)</p>
                  <textarea
                    rows={3}
                    value={implementationNote}
                    onChange={(e) => setImplementationNote(e.target.value)}
                    placeholder="Briefly describe how you resolved this requested change..."
                    className={inputCls}
                  />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setImplementingChange(null)} className={btnNeutral}>
                      Cancel
                    </button>
                    <button type="button" onClick={handleConfirmImplement} disabled={isImplementing} className={btnMoss}>
                      {isImplementing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      Confirm Implemented
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 border-l-4 border-rose-600 bg-rose-50 p-3.5 text-rose-950">
              <AlertCircle size={16} className="shrink-0 text-rose-700" />
              <span className="text-xs font-bold">{errorMessage}</span>
            </div>
          )}

          {/* Loading Full Payload State */}
          {isLoadingFullStory ? (
            <div className="space-y-4 animate-pulse py-6">
              <div className="h-6 w-3/4 bg-slate-100 rounded" />
              <div className="h-48 w-full bg-slate-100 rounded-xl" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
            </div>
          ) : isEditingContent ? (
            /* ── STRUCTURED BLOCK FORM UI ───────────────────────────────── */
            <div className="space-y-6 border-t border-[#EDEAE0] pt-6">
              
              {/* COVER IMAGE EDITING */}
              <div>
                <label className={labelCls}>Cover Photo</label>
                {currentCoverUrl ? (
                  <div className="relative flex max-h-[360px] w-full items-center justify-center overflow-hidden border border-[#D9D4C6] bg-[#1E2620] rounded-lg">
                    <img
                      src={currentCoverUrl}
                      alt="Cover preview"
                      className="max-h-[360px] w-full object-contain rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPendingCropImageSrc(currentCoverUrl);
                          setIsCropperOpen(true);
                        }}
                        className="inline-flex items-center gap-1 border border-white/20 bg-[#1E2620]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-xs transition hover:bg-[#1E2620] cursor-pointer rounded"
                      >
                        <Crop size={11} className="text-[#8FBF9F]" /> Recrop
                      </button>
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 border border-[#3F6B4F] bg-[#3F6B4F] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#345A42] cursor-pointer rounded"
                      >
                        <Upload size={11} /> Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center border-2 border-dashed border-[#D9D4C6] bg-[#FAF9F5] p-5 text-[#3F6B4F] transition hover:bg-white cursor-pointer rounded-lg"
                  >
                    <Upload size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Upload Cover Photo</span>
                  </button>
                )}
              </div>

              {/* TITLE & CATEGORY FIELDS */}
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Article Title *</label>
                  <input
                    type="text"
                    required
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    style={displayFont}
                    className={`${inputCls} text-base font-bold italic text-[#1E2620]`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Category Tag *</label>
                  <select
                    value={articleTag}
                    onChange={(e) => setArticleTag(e.target.value)}
                    className={`${inputCls} font-semibold`}
                  >
                    <option value="General">General</option>
                    <option value="Agribusiness">Agribusiness</option>
                    <option value="Technology">Technology</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="BioCap">BioCap</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label className={labelCls}>Excerpt / Brief Summary *</label>
                  <span className="text-[10px] font-semibold tabular-nums text-[#5A6259]" style={monoFont}>
                    {articleExcerpt.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={articleExcerpt}
                  onChange={(e) => setArticleExcerpt(e.target.value)}
                  placeholder="Short summary for preview cards..."
                  className={`${inputCls} leading-relaxed text-justify text-justify-inter-word`}
                />
              </div>

              {/* Block-Based Content Form Engine */}
              <div className="space-y-3 border-t border-[#EDEAE0] pt-4">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    Story Body Sections ({editedBlocks.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addTextBlock}
                      className="inline-flex items-center gap-1 border border-[#3F6B4F]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#3F6B4F] hover:bg-[#F1F5F1] cursor-pointer rounded"
                    >
                      <Plus size={13} /> Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={addImageBlock}
                      className="inline-flex items-center gap-1 border border-[#3F6B4F]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#3F6B4F] hover:bg-[#F1F5F1] cursor-pointer rounded"
                    >
                      <ImageIcon size={13} /> Inline Photo
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {editedBlocks.map((block, idx) => (
                    <div key={idx} className="relative space-y-3 border border-[#E2DDCF] bg-[#FAF9F5] p-3.5 rounded-lg">
                      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-[#8B9188]" style={monoFont}>
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
                          className="w-full border border-[#D9D4C6] bg-white p-2.5 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none rounded text-justify text-justify-inter-word leading-relaxed"
                          placeholder="Paragraph body text..."
                        />
                      ) : (
                        <div className="space-y-3">
                          {block.src || block.url ? (
                            <div className="relative max-h-[400px] w-full overflow-hidden border border-[#D9D4C6] bg-[#1E2620] rounded-lg flex items-center justify-center">
                              <img
                                src={block.src || block.url}
                                alt={block.caption || `Section ${idx + 1}`}
                                className="max-h-[400px] w-full object-contain rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-[#D9D4C6] bg-white p-4 text-center rounded-lg">
                              <p className="text-xs text-[#8B9188]">No image selected for this block yet</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <label className="inline-flex cursor-pointer items-center gap-1.5 border border-[#3F6B4F]/40 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3F6B4F] transition hover:bg-[#F1F5F1] rounded">
                              <Upload size={13} /> Choose Section Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSectionImageChange(idx, e.target.files?.[0])}
                                className="hidden"
                              />
                            </label>

                            <div className="flex items-center gap-1 text-xs" style={monoFont}>
                              <span className="mr-1 text-[#8B9188]">Fit:</span>
                              <button
                                type="button"
                                onClick={() => updateBlockFitMode(idx, "cover")}
                                className={`border px-2 py-0.5 text-[10px] font-semibold uppercase cursor-pointer rounded ${
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
                                className={`border px-2 py-0.5 text-[10px] font-semibold uppercase cursor-pointer rounded ${
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
                            className="w-full border border-[#D9D4C6] bg-white p-2 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── INTERACTIVE DIRECT CLICK-TO-EDIT MANUSCRIPT PREVIEW ──────── */
            <div className="space-y-6 text-[#1E2620]">
              
              {/* Click to Edit Title */}
              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setArticleTitle(e.currentTarget.textContent || "")}
                className="text-2xl font-bold italic leading-tight text-[#1B3A5C] sm:text-3xl p-2 border border-transparent hover:border-dashed hover:border-[#3F6B4F] focus:border-solid focus:border-[#3F6B4F] focus:bg-[#FAF9F5] focus:outline-none rounded transition-all cursor-text"
                style={displayFont}
                title="Click to edit title directly"
              >
                {articleTitle || "Untitled Story"}
              </h1>

              {/* Cover Image Container */}
              {currentCoverUrl && (
                <div className="relative group overflow-hidden rounded-xl border border-[#D9D4C6] bg-[#1E2620] max-h-[480px] w-full flex items-center justify-center">
                  <img
                    src={currentCoverUrl}
                    alt={articleTitle}
                    className="max-h-[480px] w-full object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-xs font-bold px-3 py-1.5 rounded border border-[#D9D4C6] shadow-sm transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    Change Cover Image
                  </button>
                </div>
              )}

              {/* Click to Edit Excerpt */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setArticleExcerpt(e.currentTarget.textContent || "")}
                className="border-l-[3px] border-[#C22055] bg-slate-50 p-4 text-xs sm:text-sm italic text-[#3A4239] leading-relaxed hover:bg-slate-100 focus:bg-white focus:outline-none transition-all cursor-text"
                title="Click to edit summary directly"
              >
                {articleExcerpt || "Click here to add an article summary..."}
              </div>

              {/* Click-to-Edit Paragraph Blocks with Formatting Bubble Bar */}
              <div className="space-y-6 pt-2">
                {editedBlocks && editedBlocks.length > 0 ? (
                  editedBlocks.map((block: BlogBlock, idx: number) => {
                    if (block.type === 'image' && (block.src || block.url)) {
                      return (
                        <figure key={idx} className="my-6 space-y-2">
                          <div className="overflow-hidden rounded-xl border border-[#D9D4C6] bg-[#1E2620] max-h-[480px] flex items-center justify-center">
                            <img
                              src={block.src || block.url}
                              alt={block.caption || `Section ${idx + 1}`}
                              className="w-full max-h-[480px] object-contain rounded-xl"
                            />
                          </div>
                        </figure>
                      );
                    }

                    return (
                      <EditableParagraph
                        key={idx}
                        index={idx}
                        html={block.text || ""}
                        onCommit={updateBlockText}
                      />
                    );
                  })
                ) : (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateBlockText(0, e.currentTarget.textContent || "")}
                    className="text-xs italic text-[#8B9188] p-2 border border-dashed border-[#D9D4C6] cursor-text"
                  >
                    Click to start writing content body...
                  </p>
                )}
              </div>

              {/* Author Credentials & Attachments Bar */}
              {(() => {
                const rawSocialHandle = localStory.socialHandle || creator?.socialHandle || "";
                if (!rawSocialHandle && !isFilteredOrgLink && !localStory.document && !localStory.documentUrl) {
                  return null;
                }

                return (
                  <div className="pt-6 border-t border-[#EDEAE0] space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B9188]" style={monoFont}>
                      Attached Credentials &amp; External Documents
                    </p>
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
                          href={localStory.organizationLink}
                          target="_blank"
                          rel="noreferrer"
                          title={`Organization: ${localStory.organizationLink}`}
                          className="inline-flex items-center justify-center text-[#1B3A5C] hover:text-[#C22055] transition-transform hover:scale-110"
                        >
                          <Globe size={22} />
                        </a>
                      )}

                      {(localStory.document || localStory.documentUrl) && (
                        <a
                          href={localStory.documentUrl || localStory.document}
                          target="_blank"
                          rel="noreferrer"
                          title={localStory.documentName || 'Download Document PDF'}
                          className="inline-flex items-center justify-center text-[#2F8F5B] hover:text-[#C22055] transition-transform hover:scale-110"
                        >
                          <FileText size={22} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Embedded Moderated Comments Section */}
          <div className="pt-4 border-t border-[#EDEAE0]">
            <CommentManager
              articleId={localStory._id}
              slug={localStory.slug}
              currentUserRole={currentUserRole}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E2DDCF] bg-[#F7F6F2] px-6 py-4">
          <button type="button" disabled={isSubmitting} onClick={onClose} className={btnNeutral}>
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, false)}
            className={btnNeutral}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleUpdateStory(e, true)}
            className={btnGold}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {isSubmitting ? "Submitting..." : "Save & Submit"}
          </button>
        </div>
      </div>

      {/* Cover Image Cropper Modal */}
      {pendingCropSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={pendingCropSrc}
          aspectRatio={16 / 9}
          onClose={() => {
            setIsCropperOpen(false);
            setPendingCropImageSrc(null);
          }}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}