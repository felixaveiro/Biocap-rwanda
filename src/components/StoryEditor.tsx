'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import ImageCropperModal from "@/components/ImageCropperModal";
import { base64ToFile } from "@/lib/utils/file";
import {
  Crop,
  Plus,
  Trash2,
  ImagePlus,
  ChevronUp,
  ChevronDown,
  ImageOff,
  Heading,
  Quote,
  Pilcrow,
  Link2,
  AlertCircle,
  ExternalLink,
  Unlink,
} from "lucide-react";

// ── Type system ──────────────────────────────────────────────
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

type SectionKind = "paragraph" | "heading" | "quote" | "image";

interface Section {
  id: string;
  kind: SectionKind;
  text: string;
  plainText?: string;
  attribution?: string;
  imageFile?: File | null;
  imagePreview?: string | null;
  imageFileKey?: string | null;
  caption?: string;
  fitMode?: "cover" | "contain";
}

interface Props {
  excerpt: string;
  setExcerpt: (v: string) => void;
  initialSections?: Section[];
  onChange?: (blocks: any[], files: File[]) => void;
  controlsPosition?: "top" | "bottom";
}

const pad = (n: number) => String(n).padStart(2, "0");

const wordCount = (text: string) =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;

const KIND_META: Record<SectionKind, { glyph: string; label: string; icon: typeof Pilcrow }> = {
  paragraph: { glyph: "¶", label: "Paragraph", icon: Pilcrow },
  heading: { glyph: "§", label: "Heading", icon: Heading },
  quote: { glyph: "“", label: "Pull quote", icon: Quote },
  image: { glyph: "🖼", label: "Image", icon: ImagePlus },
};

const KIND_ORDER: SectionKind[] = ["paragraph", "heading", "quote", "image"];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const stripMarkdownLinks = (text: string) =>
  (text || "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

function markdownToHtml(text: string): string {
  const src = text || "";
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(src))) {
    result += escapeHtml(src.slice(lastIndex, match.index));
    const label = escapeHtml(match[1]);
    const href = escapeHtml(match[2]);
    result += `<span class="editor-link" data-href="${href}">${label}</span>`;
    lastIndex = regex.lastIndex;
  }
  result += escapeHtml(src.slice(lastIndex));
  return result;
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;

    if (el.tagName === "BR") return "\n";

    if (el.classList.contains("editor-link")) {
      const href = el.getAttribute("data-href") || "";
      const inner = Array.from(el.childNodes).map(serializeNode).join("");
      return `[${inner}](${href})`;
    }

    if (el.tagName === "DIV" || el.tagName === "P") {
      return Array.from(el.childNodes).map(serializeNode).join("") + "\n";
    }

    return Array.from(el.childNodes).map(serializeNode).join("");
  }
  return "";
}

function serializeContainer(container: HTMLElement): string {
  return Array.from(container.childNodes)
    .map(serializeNode)
    .join("")
    .replace(/\n+$/, "");
}

interface ActiveSelection {
  sectionId: string;
  range: Range;
}

interface LinkPopoverState {
  sectionId: string;
  top: number;
  left: number;
}

interface ActiveLinkPreviewState {
  sectionId: string;
  url: string;
  top: number;
  left: number;
  element: HTMLElement;
}

export default function StoryEditor({ excerpt, setExcerpt, initialSections, onChange }: Props) {
  const [sections, setSections] = useState<Section[]>(() =>
    (initialSections && initialSections.length > 0
      ? initialSections
      : [{ id: crypto.randomUUID(), kind: "paragraph" as SectionKind, text: "", fitMode: "cover" as const }]
    ).map((sec) => ({
      ...sec,
      plainText: sec.plainText ?? stripMarkdownLinks(sec.text || ""),
    }))
  );

  const [croppingSectionId, setCroppingSectionId] = useState<string | null>(null);
  const [rawCropSrc, setRawCropSrc] = useState<string | null>(null);

  const editableRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const linkUrlInputRef = useRef<HTMLInputElement>(null);
  const [linkPopover, setLinkPopover] = useState<LinkPopoverState | null>(null);
  const [linkUrlValue, setLinkUrlValue] = useState("");

  const [activeLinkPreview, setActiveLinkPreview] = useState<ActiveLinkPreviewState | null>(null);
  const activeSelectionRef = useRef<ActiveSelection | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // OPTIMIZED BLOCK PAYLOAD BUILDER
  useEffect(() => {
    const blocks: any[] = [];
    const files: File[] = [];

    for (const sec of sections) {
      const text = (sec.text || "").trim();

      if (sec.kind === "heading") {
        if (text) blocks.push({ type: "h2", text });
        continue;
      }

      if (sec.kind === "quote") {
        if (text) blocks.push({ type: "quote", text, caption: (sec.attribution || "").trim() });
        continue;
      }

      if (sec.kind === "paragraph" && text) {
        const paragraphs = text
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean);

        paragraphs.forEach((pText) => {
          blocks.push({ type: "p", text: pText });
        });
      }

      if (sec.imageFile || sec.imagePreview) {
        const fileKey = sec.imageFileKey || `section-img-${sec.id}.jpg`;
        
        const displaySrc = sec.imagePreview?.startsWith("data:image")
          ? undefined
          : sec.imagePreview;

        blocks.push({
          type: "image",
          fileKey: fileKey,
          src: displaySrc,
          rawFile: sec.imageFile || undefined,
          caption: (sec.caption || "").trim(),
          fitMode: sec.fitMode || "cover",
        });

        if (sec.imageFile) {
          files.push(sec.imageFile);
        }
      }
    }

    onChangeRef.current?.(blocks, files);
  }, [sections]);

  useEffect(() => {
    if (!linkPopover && !activeLinkPreview) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (linkPopoverRef.current?.contains(target)) return;
      
      const activeEl = editableRefs.current.get(
        linkPopover?.sectionId || activeLinkPreview?.sectionId || ""
      );
      if (activeEl && activeEl.contains(target)) return;
      
      closeLinkPopover();
      setActiveLinkPreview(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [linkPopover, activeLinkPreview]);

  const closeLinkPopover = () => {
    setLinkPopover(null);
    setLinkUrlValue("");
    activeSelectionRef.current = null;
  };

  const handleInput = (sectionId: string, el: HTMLDivElement) => {
    const markdown = serializeContainer(el).replace(/\u200B/g, "");
    const plain = (el.textContent || "").replace(/\u200B/g, "");
    setSections((s) =>
      s.map((sec) => (sec.id === sectionId ? { ...sec, text: markdown, plainText: plain } : sec))
    );
  };

  const handleTextSelection = (sectionId: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      if (!linkUrlValue) closeLinkPopover();
      return;
    }

    const el = editableRefs.current.get(sectionId);
    if (!el || !el.contains(sel.anchorNode)) return;

    const anchorEl =
      sel.anchorNode?.nodeType === Node.TEXT_NODE
        ? sel.anchorNode.parentElement
        : (sel.anchorNode as HTMLElement | null);

    if (anchorEl?.closest(".editor-link")) {
      closeLinkPopover();
      return;
    }

    setActiveLinkPreview(null);
    const range = sel.getRangeAt(0);
    activeSelectionRef.current = { sectionId, range: range.cloneRange() };

    const rect = range.getBoundingClientRect();
    setLinkPopover({ sectionId, top: rect.top, left: rect.left + rect.width / 2 });
    requestAnimationFrame(() => linkUrlInputRef.current?.focus());
  };

  const handleEditorClick = (sectionId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest(".editor-link") as HTMLElement | null;
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    closeLinkPopover();

    const href = target.getAttribute("data-href") || "";
    const rect = target.getBoundingClientRect();

    setActiveLinkPreview({
      sectionId,
      url: href,
      top: rect.top,
      left: rect.left + rect.width / 2,
      element: target,
    });
  };

  const openUrlInNewTab = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }
    const newTab = window.open(finalUrl, "_blank", "noopener,noreferrer");
    if (newTab) {
      newTab.focus();
    }
  };

  const removeAppliedLink = () => {
    if (!activeLinkPreview) return;
    const { sectionId, element } = activeLinkPreview;
    const el = editableRefs.current.get(sectionId);

    const parent = element.parentNode;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }

    if (el) handleInput(sectionId, el);
    setActiveLinkPreview(null);
  };

  const applyLink = () => {
    const active = activeSelectionRef.current;
    if (!active) return;
    let url = linkUrlValue.trim();
    if (!url) return;

    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
      url = `https://${url}`;
    }

    const { sectionId, range } = active;
    const el = editableRefs.current.get(sectionId);
    if (!el) return;

    el.focus();
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const span = document.createElement("span");
    span.className = "editor-link";
    span.setAttribute("data-href", url);

    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    } catch (err) {
      console.error("Failed to insert link element:", err);
      closeLinkPopover();
      return;
    }

    const spacer = document.createTextNode("\u200B");
    if (span.parentNode) {
      if (span.nextSibling) {
        span.parentNode.insertBefore(spacer, span.nextSibling);
      } else {
        span.parentNode.appendChild(spacer);
      }
    }

    if (sel) {
      const newRange = document.createRange();
      newRange.setStart(spacer, spacer.length);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    handleInput(sectionId, el);
    closeLinkPopover();
  };

  const handleImageSelect = (id: string, file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawCropSrc(reader.result as string);
      setCroppingSectionId(id);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = (croppedBase64: string) => {
    if (!croppingSectionId) return;

    const fileKey = `${crypto.randomUUID()}__inline.jpg`;
    const renamedFile = base64ToFile(croppedBase64, fileKey);
    const blobPreviewUrl = URL.createObjectURL(renamedFile);

    setSections((s) =>
      s.map((sec) =>
        sec.id === croppingSectionId
          ? {
              ...sec,
              imageFile: renamedFile,
              imagePreview: blobPreviewUrl,
              imageFileKey: fileKey,
            }
          : sec
      )
    );

    setCroppingSectionId(null);
    setRawCropSrc(null);
  };

  const removeImage = (id: string) => {
    setSections((s) =>
      s.map((sec) =>
        sec.id === id
          ? { ...sec, imageFile: null, imagePreview: null, imageFileKey: null, caption: "" }
          : sec
      )
    );
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections((s) => {
      const idx = s.findIndex((x) => x.id === id);
      const swapIdx = idx + dir;
      if (idx === -1 || swapIdx < 0 || swapIdx >= s.length) return s;
      const next = [...s];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  const setKind = (id: string, kind: SectionKind) => {
    setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, kind } : sec)));
  };

  const addSection = () => {
    setSections((s) => [
      ...s,
      {
        id: crypto.randomUUID(),
        kind: "paragraph",
        text: "",
        plainText: "",
        imageFile: null,
        imagePreview: null,
        imageFileKey: null,
        fitMode: "cover",
      },
    ]);
  };

  const setEditableRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      editableRefs.current.set(id, el);
      if (!el.dataset.initialized) {
        const sec = sections.find((s) => s.id === id);
        el.innerHTML = markdownToHtml(sec?.text || "");
        el.dataset.initialized = "true";
      }
    } else {
      editableRefs.current.delete(id);
    }
  };

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div className={`${fontVars} space-y-6`} style={bodyFont}>
      <style>{`
        .story-editable {
          white-space: pre-wrap;
          word-break: break-word;
          outline: none;
          text-align: justify !important;
          text-justify: inter-word !important;
        }
        .story-editable:empty:before {
          content: attr(data-placeholder);
          color: #B4B0A2;
          pointer-events: none;
        }
        .editor-link {
          color: #1a73e8;
          text-decoration: underline;
          text-decoration-color: #1a73e8;
          text-underline-offset: 2px;
          font-weight: 500;
          cursor: pointer;
        }
        .editor-link:hover {
          color: #1557b0;
        }
      `}</style>

      {/* 🟢 DYNAMICALLY AUTO-EXPANDING & JUSTIFIED EXCERPT FIELD */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#1E2620]">
            Excerpt / Brief Summary *
          </label>
          <span className="text-[10px] font-semibold tabular-nums text-[#5A6259]">
            {excerpt.length} chars
          </span>
        </div>
        <textarea
          rows={3}
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          ref={(textarea) => {
            if (textarea) {
              textarea.style.height = "auto";
              textarea.style.height = `${textarea.scrollHeight}px`;
            }
          }}
          placeholder="Short summary for preview cards..."
          className="w-full border border-[#D9D4C6] bg-white p-3 text-xs text-[#1E2620] placeholder:text-[#8B9188] focus:border-[#3F6B4F] focus:outline-none overflow-hidden resize-none transition-[height] duration-100 leading-relaxed text-justify text-justify-inter-word"
        />
      </div>

      {/* Manuscript Section */}
      <div className="border border-[#E2DDCF] bg-white">
        <div className="flex items-center justify-between border-b border-[#EDEAE0] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
              Manuscript
            </p>
            <p className="mt-0.5 text-lg italic text-[#1E2620]" style={displayFont}>
              Story body
            </p>
          </div>
          <p className="hidden text-[10px] text-[#B4B0A2] sm:block" style={monoFont}>
            Select text to insert link · Click link to view or open in new tab
          </p>
        </div>

        <div className="divide-y divide-[#EDEAE0]">
          {sections.map((sec, idx) => {
            const meta = KIND_META[sec.kind];
            const hasImage = Boolean(sec.imagePreview);
            const isCaptionMissing = hasImage && !(sec.caption || "").trim();

            return (
              <div key={sec.id} className="flex gap-4 p-5 transition-opacity duration-200">
                <div className="flex w-9 shrink-0 flex-col items-center gap-2 pt-0.5">
                  <span
                    className="text-sm font-semibold tabular-nums text-[#A9812F]"
                    style={monoFont}
                    aria-hidden
                    title={meta.label}
                  >
                    {meta.glyph}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(sec.id, -1)}
                      aria-label="Move section up"
                      className="rounded-sm p-0.5 text-[#8B9188] transition-colors hover:bg-[#EDEAE0] hover:text-[#1E2620] disabled:pointer-events-none disabled:opacity-25"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(sec.id, 1)}
                      aria-label="Move section down"
                      className="rounded-sm p-0.5 text-[#8B9188] transition-colors hover:bg-[#EDEAE0] hover:text-[#1E2620] disabled:pointer-events-none disabled:opacity-25"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <div className="w-px flex-1 bg-[#EDEAE0]" />
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="inline-flex border border-[#D9D4C6]">
                      {KIND_ORDER.map((k) => {
                        const active = sec.kind === k;
                        const Icon = KIND_META[k].icon;
                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setKind(sec.id, k)}
                            className={`inline-flex items-center gap-1 border-l border-[#D9D4C6] first:border-l-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                              active ? "bg-[#1E2620] text-white" : "bg-white text-[#5A6259] hover:bg-[#FAF9F5]"
                            }`}
                          >
                            <Icon size={11} /> {KIND_META[k].label}
                          </button>
                        );
                      })}
                    </div>

                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSections((s) => s.filter((x) => x.id !== sec.id))}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#B65C4B] transition-opacity hover:opacity-70 cursor-pointer"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  {sec.kind !== "image" && (
                    <div
                      ref={setEditableRef(sec.id)}
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder={
                        sec.kind === "heading"
                          ? "Section heading..."
                          : sec.kind === "quote"
                          ? "The words being quoted..."
                          : `Paragraph ${idx + 1} content...`
                      }
                      onInput={(e) => handleInput(sec.id, e.currentTarget)}
                      onMouseUp={() => handleTextSelection(sec.id)}
                      onKeyUp={() => handleTextSelection(sec.id)}
                      onClick={(e) => handleEditorClick(sec.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document.execCommand("insertText", false, "\n");
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
                        document.execCommand("insertText", false, text);
                      }}
                      style={sec.kind === "heading" ? displayFont : undefined}
                      className={`story-editable w-full border border-[#D9D4C6] bg-[#FAF9F5] px-3.5 py-2.5 leading-relaxed text-[#1E2620] transition-colors focus:border-[#3F6B4F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15 ${
                        sec.kind === "heading"
                          ? "min-h-[2.25rem] text-base italic font-semibold text-left"
                          : sec.kind === "quote"
                          ? "min-h-[3rem] text-xs italic font-medium text-left"
                          : "min-h-[4.5rem] text-xs font-normal text-justify"
                      }`}
                    />
                  )}

                  {sec.kind === "quote" && (
                    <input
                      type="text"
                      value={sec.attribution || ""}
                      onChange={(e) =>
                        setSections((s) =>
                          s.map((x) => (x.id === sec.id ? { ...x, attribution: e.target.value } : x))
                        )
                      }
                      placeholder="Attribution (optional)"
                      className="w-full border border-[#D9D4C6] bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[#8B4136] placeholder:text-[#B4B0A2] focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15 text-justify"
                    />
                  )}

                  {(sec.kind === "image" || sec.kind === "paragraph") && (
                    <>
                      {sec.kind === "paragraph" && (
                        <div className="flex items-center justify-between">
                          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-[#3A4239] transition-colors hover:text-[#3F6B4F]">
                            <ImagePlus size={13} /> {sec.imagePreview ? "Replace image" : "Add an image (optional)"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageSelect(sec.id, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] tabular-nums text-[#B4B0A2]" style={monoFont}>
                            {wordCount(sec.plainText ?? sec.text)} words
                          </span>
                        </div>
                      )}

                      {sec.imagePreview ? (
                        <div className="space-y-2.5 pt-1">
                          <div className="relative flex max-h-[650px] w-full items-center justify-center overflow-hidden border border-[#D9D4C6] bg-[#1E2620] rounded-xl">
                            <img
                              src={sec.imagePreview}
                              alt="Section preview"
                              className="max-h-[650px] w-full object-contain rounded-xl"
                            />
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setRawCropSrc(sec.imagePreview!);
                                  setCroppingSectionId(sec.id);
                                }}
                                className="inline-flex items-center gap-1 border border-white/20 bg-[#1E2620]/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-xs transition-colors hover:bg-[#1E2620] cursor-pointer rounded"
                              >
                                <Crop size={12} className="text-[#8FBF9F]" /> Recrop
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(sec.id)}
                                className="inline-flex items-center border border-white/20 bg-[#1E2620]/85 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-[#B65C4B] cursor-pointer rounded"
                              >
                                <ImageOff size={13} />
                              </button>
                            </div>
                            <span
                              className="absolute bottom-2 left-2 border border-white/15 bg-[#1E2620]/85 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#A9812F] backdrop-blur-xs rounded"
                              style={monoFont}
                            >
                              Fig. {pad(idx + 1)}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]">
                                Image Caption <span className="text-[#B65C4B]">*</span>
                              </label>
                              {isCaptionMissing && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#B65C4B]">
                                  <AlertCircle size={10} /> Mandatory when image is attached
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              required
                              value={sec.caption || ""}
                              onChange={(e) =>
                                setSections((s) =>
                                  s.map((x) => (x.id === sec.id ? { ...x, caption: e.target.value } : x))
                                )
                              }
                              placeholder="Describe this image (mandatory for publication)..."
                              className={`w-full border px-3 py-1.5 text-[11px] italic text-[#1E2620] placeholder:text-[#B4B0A2] focus:outline-none focus:ring-2 transition-colors text-justify ${
                                isCaptionMissing
                                  ? "border-[#B65C4B] bg-[#FBEEEC]/30 focus:border-[#B65C4B] focus:ring-[#B65C4B]/20"
                                  : "border-[#D9D4C6] bg-white focus:border-[#3F6B4F] focus:ring-[#3F6B4F]/15"
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <label className="group relative flex h-36 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#D9D4C6] bg-[#FAF9F5] transition-colors duration-200 hover:border-[#3F6B4F] hover:bg-[#F3F2ED] rounded-xl">
                          <ImagePlus size={22} className="text-[#B4B0A2] transition-colors group-hover:text-[#3F6B4F]" />
                          <span className="mt-2 text-[11px] font-medium text-[#8B9188] transition-colors group-hover:text-[#3F6B4F]">
                            No image attached (click to browse)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageSelect(sec.id, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end border-t border-[#EDEAE0] bg-[#FAF9F5] p-4">
          <button
            type="button"
            onClick={addSection}
            className="group inline-flex items-center gap-1.5 border border-[#1E2620] bg-[#1E2620] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] cursor-pointer"
          >
            <Plus size={14} className="transition-transform group-hover:rotate-90" /> Add section
          </button>
        </div>
      </div>

      {/* Floating Link Popover */}
      {linkPopover && (
        <div
          ref={linkPopoverRef}
          className="fixed z-50 -translate-x-1/2 -translate-y-full flex items-center gap-2 rounded-2xl border border-[#D0D5DD] bg-white px-3 py-2 shadow-xl animate-in fade-in zoom-in-95 duration-100"
          style={{ top: linkPopover.top - 12, left: linkPopover.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#1a73e8] bg-white px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#1a73e8]/20">
            <Link2 size={16} className="text-[#5f6368] shrink-0" />
            <input
              ref={linkUrlInputRef}
              type="text"
              value={linkUrlValue}
              onChange={(e) => setLinkUrlValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  closeLinkPopover();
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Type or paste a link"
              className="w-56 bg-transparent text-xs text-[#202124] placeholder:text-[#80868b] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyLink();
            }}
            disabled={!linkUrlValue.trim()}
            className="px-3 py-1.5 text-xs font-semibold text-[#1a73e8] hover:bg-[#f1f3f4] rounded-md transition-colors disabled:text-[#c6c6c6] disabled:pointer-events-none cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* Link Floating Preview Card */}
      {activeLinkPreview && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full flex items-center gap-3 rounded-xl border border-[#D0D5DD] bg-white px-3.5 py-2 shadow-xl animate-in fade-in zoom-in-95 duration-100 text-xs text-[#202124]"
          style={{ top: activeLinkPreview.top - 10, left: activeLinkPreview.left }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex items-center gap-1.5 max-w-[220px] truncate">
            <Link2 size={14} className="text-[#1a73e8] shrink-0" />
            <button
              type="button"
              onMouseDown={(e) => openUrlInNewTab(e, activeLinkPreview.url)}
              onClick={(e) => openUrlInNewTab(e, activeLinkPreview.url)}
              className="truncate text-[#1a73e8] hover:underline cursor-pointer font-medium"
              title={`Open ${activeLinkPreview.url} in new tab`}
            >
              {activeLinkPreview.url}
            </button>
          </div>

          <div className="h-4 w-px bg-[#E2DDCF]" />

          <button
            type="button"
            onMouseDown={(e) => openUrlInNewTab(e, activeLinkPreview.url)}
            onClick={(e) => openUrlInNewTab(e, activeLinkPreview.url)}
            className="inline-flex items-center gap-1 text-[#1a73e8] font-semibold hover:text-[#1557b0] transition-colors cursor-pointer"
            title="Open link in new tab"
          >
            <ExternalLink size={14} /> Open
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeAppliedLink();
            }}
            onClick={removeAppliedLink}
            className="inline-flex items-center gap-1 text-[#B65C4B] hover:text-[#8A3A2C] transition-colors cursor-pointer ml-1"
            title="Remove link"
          >
            <Unlink size={14} />
          </button>
        </div>
      )}

      {/* Image Cropper Modal */}
      {rawCropSrc && (
        <ImageCropperModal
          isOpen={!!croppingSectionId}
          imageSrc={rawCropSrc}
          onClose={() => {
            setCroppingSectionId(null);
            setRawCropSrc(null);
          }}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}