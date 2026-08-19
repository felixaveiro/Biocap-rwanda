"use client";

import React, { useEffect, useState, useRef } from "react";
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

type SectionKind = "paragraph" | "heading" | "quote";

interface Section {
  id: string;
  kind: SectionKind;
  text: string;
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
}

const pad = (n: number) => String(n).padStart(2, "0");

const wordCount = (text: string) =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;

const KIND_META: Record<SectionKind, { glyph: string; label: string; icon: typeof Pilcrow }> = {
  paragraph: { glyph: "¶", label: "Paragraph", icon: Pilcrow },
  heading: { glyph: "§", label: "Heading", icon: Heading },
  quote: { glyph: "“", label: "Pull quote", icon: Quote },
};

const KIND_ORDER: SectionKind[] = ["paragraph", "heading", "quote"];

export default function StoryEditor({ excerpt, setExcerpt, initialSections, onChange }: Props) {
  const [sections, setSections] = useState<Section[]>(() =>
    initialSections && initialSections.length > 0
      ? initialSections
      : [{ id: crypto.randomUUID(), kind: "paragraph", text: "", fitMode: "cover" }]
  );

  const [croppingSectionId, setCroppingSectionId] = useState<string | null>(null);
  const [rawCropSrc, setRawCropSrc] = useState<string | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

      // Paragraph splitting: split multi-line textarea text on Enter (\n)
      if (text) {
        const paragraphs = text
          .split(/\n+/) // Splits by single or double Enter
          .map((p) => p.trim())
          .filter(Boolean);

        paragraphs.forEach((pText) => {
          blocks.push({ type: "p", text: pText });
        });
      }

      if (sec.imageFile || sec.imagePreview) {
        const fileKey = sec.imageFileKey || `section-img-${sec.id}.jpg`;
        blocks.push({
          type: "image",
          fileKey: fileKey,
          src: sec.imagePreview?.startsWith("http") ? sec.imagePreview : undefined,
          caption: sec.caption || "",
          fitMode: sec.fitMode || "cover",
        });

        if (sec.imageFile) {
          files.push(sec.imageFile);
        }
      }
    }

    onChangeRef.current?.(blocks, files);
  }, [sections]);

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
    const renamed = base64ToFile(croppedBase64, fileKey);

    setSections((s) =>
      s.map((sec) =>
        sec.id === croppingSectionId
          ? { ...sec, imageFile: renamed, imagePreview: croppedBase64, imageFileKey: fileKey }
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
    setSections((s) =>
      s.map((sec) => (sec.id === id ? { ...sec, kind } : sec))
    );
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <div className={`${fontVars} space-y-6`} style={bodyFont}>
      <div className="border border-[#E2DDCF] bg-white p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
            Excerpt / brief summary
          </label>
          <span className="text-[10px] tabular-nums text-[#B4B0A2]" style={monoFont}>
            {excerpt.length} chars
          </span>
        </div>
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full border border-[#D9D4C6] px-4 py-2.5 text-xs text-[#1E2620] placeholder:text-[#B4B0A2] transition-colors focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15"
          placeholder="Short description for preview cards..."
        />
      </div>

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
          <button
            type="button"
            onClick={() =>
              setSections((s) => [
                ...s,
                {
                  id: crypto.randomUUID(),
                  kind: "paragraph",
                  text: "",
                  imageFile: null,
                  imagePreview: null,
                  imageFileKey: null,
                  fitMode: "cover",
                },
              ])
            }
            className="group inline-flex items-center gap-1.5 border border-[#1E2620] bg-[#1E2620] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3F6B4F]/40"
          >
            <Plus size={13} className="transition-transform group-hover:rotate-90" /> Add section
          </button>
        </div>

        <div className="divide-y divide-[#EDEAE0]">
          {sections.map((sec, idx) => {
            const meta = KIND_META[sec.kind];
            return (
              <div
                key={sec.id}
                className="flex gap-4 p-5 transition-opacity duration-200 motion-reduce:transition-none"
              >
                {/* Manuscript spine: kind mark + reorder controls */}
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
                      aria-label={`Move section ${idx + 1} up`}
                      className="rounded-sm p-0.5 text-[#8B9188] transition-colors hover:bg-[#EDEAE0] hover:text-[#1E2620] disabled:pointer-events-none disabled:opacity-25"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(sec.id, 1)}
                      aria-label={`Move section ${idx + 1} down`}
                      className="rounded-sm p-0.5 text-[#8B9188] transition-colors hover:bg-[#EDEAE0] hover:text-[#1E2620] disabled:pointer-events-none disabled:opacity-25"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <div className="w-px flex-1 bg-[#EDEAE0]" />
                </div>

                {/* Section content */}
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Kind selector */}
                    <div className="inline-flex border border-[#D9D4C6]">
                      {KIND_ORDER.map((k) => {
                        const active = sec.kind === k;
                        const Icon = KIND_META[k].icon;
                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setKind(sec.id, k)}
                            className={`inline-flex items-center gap-1 border-l border-[#D9D4C6] first:border-l-0 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#B65C4B] transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B65C4B]/40 rounded-sm"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={sec.kind === "heading" ? 1 : 3}
                    value={sec.text}
                    onInput={(e) => autoGrow(e.currentTarget)}
                    onChange={(e) =>
                      setSections((s) => s.map((x) => (x.id === sec.id ? { ...x, text: e.target.value } : x)))
                    }
                    placeholder={
                      sec.kind === "heading"
                        ? "Section heading, e.g. “A window into Rwanda’s biotechnology future”"
                        : sec.kind === "quote"
                        ? "The words being quoted..."
                        : `Paragraph ${idx + 1} content...`
                    }
                    style={sec.kind === "heading" ? displayFont : undefined}
                    className={`w-full resize-none overflow-hidden border border-[#D9D4C6] bg-[#FAF9F5] px-3 py-2 leading-relaxed text-[#1E2620] placeholder:text-[#B4B0A2] transition-colors focus:border-[#3F6B4F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15 ${
                      sec.kind === "heading" ? "text-base italic" : sec.kind === "quote" ? "text-xs italic" : "text-xs"
                    }`}
                  />

                  {sec.kind === "quote" && (
                    <input
                      type="text"
                      value={sec.attribution || ""}
                      onChange={(e) =>
                        setSections((s) =>
                          s.map((x) => (x.id === sec.id ? { ...x, attribution: e.target.value } : x))
                        )
                      }
                      placeholder="Attribution, e.g. FAO Rwanda Representative (optional)"
                      className="w-full border border-[#D9D4C6] bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[#8B4136] placeholder:text-[#B4B0A2] placeholder:normal-case placeholder:font-normal focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15"
                    />
                  )}

                  {sec.kind === "paragraph" && (
                    <>
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
                          {wordCount(sec.text)} words
                        </span>
                      </div>

                      {sec.imagePreview ? (
                        <div className="space-y-2.5 pt-1">
                          <div className="relative flex max-h-64 items-center justify-center overflow-hidden border border-[#D9D4C6] bg-[#1E2620]">
                            <img
                              src={sec.imagePreview}
                              alt=""
                              className={`max-h-64 w-full ${sec.fitMode === "contain" ? "object-contain" : "object-cover"}`}
                            />
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setRawCropSrc(sec.imagePreview!);
                                  setCroppingSectionId(sec.id);
                                }}
                                aria-label="Recrop image"
                                className="inline-flex items-center gap-1 border border-white/20 bg-[#1E2620]/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-xs transition-colors hover:bg-[#1E2620]"
                              >
                                <Crop size={12} className="text-[#8FBF9F]" /> Recrop
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(sec.id)}
                                aria-label="Remove image"
                                className="inline-flex items-center border border-white/20 bg-[#1E2620]/85 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-[#B65C4B]"
                              >
                                <ImageOff size={13} />
                              </button>
                            </div>
                            <span
                              className="absolute bottom-2 left-2 border border-white/15 bg-[#1E2620]/85 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#A9812F] backdrop-blur-xs"
                              style={monoFont}
                            >
                              Fig. {pad(idx + 1)}
                            </span>
                          </div>

                          <input
                            type="text"
                            value={sec.caption || ""}
                            onChange={(e) =>
                              setSections((s) =>
                                s.map((x) => (x.id === sec.id ? { ...x, caption: e.target.value } : x))
                              )
                            }
                            placeholder="Caption for this image (optional)"
                            className="w-full border border-[#D9D4C6] bg-white px-3 py-1.5 text-[11px] italic text-[#1E2620] placeholder:text-[#B4B0A2] placeholder:not-italic focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/15"
                          />

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-[#8B9188]" style={monoFont}>
                              Fit
                            </span>
                            <div className="inline-flex border border-[#D9D4C6]">
                              <button
                                type="button"
                                onClick={() => setSections((s) => s.map((x) => (x.id === sec.id ? { ...x, fitMode: "cover" } : x)))}
                                className={`px-2.5 py-1 text-[10px] font-semibold uppercase transition-colors ${
                                  sec.fitMode === "cover"
                                    ? "bg-[#1E2620] text-white"
                                    : "bg-white text-[#5A6259] hover:bg-[#FAF9F5]"
                                }`}
                              >
                                Fill
                              </button>
                              <button
                                type="button"
                                onClick={() => setSections((s) => s.map((x) => (x.id === sec.id ? { ...x, fitMode: "contain" } : x)))}
                                className={`border-l border-[#D9D4C6] px-2.5 py-1 text-[10px] font-semibold uppercase transition-colors ${
                                  sec.fitMode === "contain"
                                    ? "bg-[#1E2620] text-white"
                                    : "bg-white text-[#5A6259] hover:bg-[#FAF9F5]"
                                }`}
                              >
                                Fit whole
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed border-[#D9D4C6] bg-[#FAF9F5] py-6 text-center transition-colors hover:border-[#3F6B4F] hover:bg-[#F3F2ED]">
                          <ImagePlus size={17} className="text-[#B4B0A2]" />
                          <span className="text-[11px] font-medium text-[#8B9188]">No image attached</span>
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
      </div>

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