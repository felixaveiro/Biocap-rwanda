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
  Globe,
  MessageCircle,
  Edit3,
  Eye,
  Link as LinkIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Highlighter,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Unlink,
  ChevronDown,
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

// ── Text formatting helpers (Word-style mini toolbar) ────────────────────────
type TextAction =
  | 'bold' | 'italic' | 'underline' | 'strike' | 'sub' | 'sup'
  | 'align-left' | 'align-center' | 'align-right' | 'align-justify'
  | 'unlink' | 'clear';
type Align = 'left' | 'center' | 'right' | 'justify';
type MenuName = 'size' | 'color' | 'highlight';
type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  sub: boolean;
  sup: boolean;
  highlight: boolean;
  color: boolean;
  link: boolean;
  align: Align;
  fontSize: string;
};

const DEFAULT_TEXT_COLOR = '#3A4239';
const DEFAULT_HIGHLIGHT = '#FEF08A';
const TOOLBAR_W = 408;
const TOOLBAR_H = 96;

const NO_FORMATS: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  sub: false,
  sup: false,
  highlight: false,
  color: false,
  link: false,
  align: 'justify',
  fontSize: '14',
};

const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36];

const TEXT_COLORS = [
  '#000000', '#434343', '#7F7F7F', '#B7B7B7', '#C22055', '#E03131', '#F76707', '#F59F00', '#FFD43B', '#94D82D',
  '#2F8F5B', '#0CA678', '#15AABF', '#0057FF', '#1B3A5C', '#4C6EF5', '#7048E8', '#AE3EC9', '#A9812F', '#8B5E3C',
];

const HIGHLIGHT_COLORS = [
  '#FEF08A', '#FFE066', '#FFD8A8', '#FFC078', '#FFC9C9', '#FFA8A8', '#FCC2D7', '#F783AC', '#E599F7', '#D0BFFF',
  '#BAC8FF', '#91A7FF', '#A5D8FF', '#74C0FC', '#99E9F2', '#96F2D7', '#B2F2BB', '#8CE99A', '#D8F5A2', '#DEE2E6',
];

const EXEC_COMMANDS: Record<Exclude<TextAction, 'clear' | 'unlink'>, string> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strike: 'strikeThrough',
  sub: 'subscript',
  sup: 'superscript',
  'align-left': 'justifyLeft',
  'align-center': 'justifyCenter',
  'align-right': 'justifyRight',
  'align-justify': 'justifyFull',
};

// Detect formatting from the DOM (not queryCommandState) because the
// .published-article-link CSS forces bold + underline on links, which would
// make the browser report every link as bold/underlined.
type ElementTest = (el: HTMLElement) => boolean;

function hasFormatAncestor(
  node: Node,
  paragraph: HTMLElement,
  test: ElementTest
): boolean {
  let el: HTMLElement | null =
    node instanceof HTMLElement ? node : node.parentElement;
  while (el && el !== paragraph) {
    if (test(el)) return true;
    el = el.parentElement;
  }
  return false;
}

const isBoldEl: ElementTest = (el) => {
  const weight = el.style.fontWeight;
  return el.matches('b, strong') || weight === 'bold' || Number(weight) >= 600;
};

const isItalicEl: ElementTest = (el) =>
  el.matches('i, em') || el.style.fontStyle === 'italic';

const decorationOf = (el: HTMLElement): string =>
  `${el.style.getPropertyValue('text-decoration')} ${el.style.getPropertyValue('text-decoration-line')}`;

const isUnderlineEl: ElementTest = (el) =>
  el.matches('u') || decorationOf(el).includes('underline');

const isStrikeEl: ElementTest = (el) =>
  el.matches('s, strike, del') || decorationOf(el).includes('line-through');

const isSubEl: ElementTest = (el) => el.matches('sub');
const isSupEl: ElementTest = (el) => el.matches('sup');

const isHighlightEl: ElementTest = (el) => {
  const bg = el.style.backgroundColor;
  return el.matches('mark') || (bg !== '' && bg !== 'transparent');
};

const DEFAULT_TEXT_RGB = 'rgb(58,66,57)'; // DEFAULT_TEXT_COLOR (#3A4239) as the browser reports it

const isColorEl: ElementTest = (el) => {
  if (el.matches('a')) return false;
  if (el.matches('font[color]')) return true;
  const c = el.style.color.replace(/\s/g, '').toLowerCase();
  return c !== '' && c !== DEFAULT_TEXT_RGB && c !== DEFAULT_TEXT_COLOR.toLowerCase();
};

const isLinkEl: ElementTest = (el) => el.matches('a');

// For each toggle button: the state key it controls and the tags that carry it
const TOGGLE_FORMATS: Partial<
  Record<TextAction, { key: 'bold' | 'italic' | 'underline' | 'strike' | 'sub' | 'sup'; selector: string }>
> = {
  bold: { key: 'bold', selector: 'b, strong' },
  italic: { key: 'italic', selector: 'i, em' },
  underline: { key: 'underline', selector: 'u' },
  strike: { key: 'strike', selector: 's, strike, del' },
  sub: { key: 'sub', selector: 'sub' },
  sup: { key: 'sup', selector: 'sup' },
};

// Manually removes tags (keeping their text) that touch the current selection,
// then re-selects the same text. Used as a safety net when the browser fails to toggle off.
function unwrapIntersecting(paragraph: HTMLElement, selector: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);

  const targets = Array.from(paragraph.querySelectorAll<HTMLElement>(selector)).filter((el) =>
    range.intersectsNode(el)
  );

  let first: Node | null = null;
  let last: Node | null = null;
  for (const el of targets) {
    const kids = Array.from(el.childNodes);
    if (kids.length === 0) {
      el.remove();
      continue;
    }
    if (!first) first = kids[0];
    last = kids[kids.length - 1];
    el.replaceWith(...kids);
  }

  if (first && last && first.parentNode && last.parentNode) {
    // Select FIRST, normalize AFTER: normalize() merges text nodes, which would
    // detach `first`/`last` (no parent → setStartBefore throws). A live range
    // is adjusted automatically by normalize(), so the selection survives.
    const r = document.createRange();
    r.setStartBefore(first);
    r.setEndAfter(last);
    selection.removeAllRanges();
    selection.addRange(r);
  }
  paragraph.normalize();
}

function getAlign(node: Node, paragraph: HTMLElement): Align {
  let el: HTMLElement | null =
    node instanceof HTMLElement ? node : node.parentElement;
  while (el && el !== paragraph) {
    const a = (el.style.textAlign || el.getAttribute('align') || '').toLowerCase();
    if (a === 'left' || a === 'center' || a === 'right' || a === 'justify') return a;
    el = el.parentElement;
  }
  return 'justify'; // paragraphs are justified by default (see EditableParagraph)
}

// When a range starts at (element, offset), the text it actually covers is the child at
// that offset. Without this, a selection like "before <span>" reports the paragraph's own
// styles (e.g. size 14) instead of the selected span's (e.g. size 20).
function getStartNode(range: Range): Node {
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const child = startContainer.childNodes[startOffset];
    if (child) return child;
  }
  return startContainer;
}

function getFormatState(range: Range, paragraph: HTMLElement): FormatState {
  const node = getStartNode(range);
  const el = node instanceof HTMLElement ? node : node.parentElement;
  const size = el ? Math.round(parseFloat(window.getComputedStyle(el).fontSize)) : NaN;

  return {
    bold: hasFormatAncestor(node, paragraph, isBoldEl),
    italic: hasFormatAncestor(node, paragraph, isItalicEl),
    underline: hasFormatAncestor(node, paragraph, isUnderlineEl),
    strike: hasFormatAncestor(node, paragraph, isStrikeEl),
    sub: hasFormatAncestor(node, paragraph, isSubEl),
    sup: hasFormatAncestor(node, paragraph, isSupEl),
    highlight: hasFormatAncestor(node, paragraph, isHighlightEl),
    color: hasFormatAncestor(node, paragraph, isColorEl),
    link: hasFormatAncestor(node, paragraph, isLinkEl),
    align: getAlign(node, paragraph),
    fontSize: Number.isNaN(size) ? '14' : String(size),
  };
}

// Older saved stories used <mark> for highlight. Browsers' removeFormat / hiliteColor
// don't handle <mark>, so convert them to styled spans before those commands run.
function convertLegacyMarks(paragraph: HTMLElement) {
  paragraph.querySelectorAll('mark').forEach((m) => {
    const span = document.createElement('span');
    span.style.backgroundColor = DEFAULT_HIGHLIGHT;
    while (m.firstChild) span.appendChild(m.firstChild);
    m.replaceWith(span);
  });
}

// ── Toolbar UI pieces ────────────────────────────────────────────────────────
interface ToolbarBtnProps {
  title: string;          // "Bold (Ctrl+B)" → label "Bold" + shortcut "Ctrl+B"
  hint?: string;          // optional one-line explanation for less familiar icons
  onClick: () => void;
  active?: boolean;
  variant?: 'icon' | 'chevron';
  tooltip?: boolean;      // turn off while this button's dropdown is open
  className?: string;
  children: React.ReactNode;
}

function ToolbarBtn({
  title, hint, onClick, active, variant = 'icon', tooltip = true, className = '', children,
}: ToolbarBtnProps) {
  const size = variant === 'chevron' ? 'w-5 px-0' : 'min-w-[2rem] px-1.5';
  const state = active
    ? 'bg-[#DCEBE1] text-[#2F5A40] shadow-[inset_0_0_0_1px_rgba(63,107,79,0.45)]'
    : 'text-[#1E2620] hover:bg-[#F1F0EA]';
  const match = title.match(/^(.*?)\s*\((.+)\)$/);
  const label = match ? match[1] : title;
  const shortcut = match ? match[2] : '';

  return (
    <button
      type="button"
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex h-8 items-center justify-center rounded-md transition-colors cursor-pointer ${size} ${state} ${className}`}
    >
      {children}
      {tooltip && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[210px] -translate-x-1/2 rounded-md bg-[#1E2620] px-2.5 py-1.5 text-left text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 group-hover:delay-300 group-focus-visible:opacity-100"
        >
          <span className="block font-semibold">
            {label}
            {shortcut && <span className="ml-1.5 font-normal text-white/60">{shortcut}</span>}
          </span>
          {hint && <span className="mt-0.5 block font-normal text-white/70">{hint}</span>}
        </span>
      )}
    </button>
  );
}

// Word's "Clear All Formatting" icon: a letter A with a pink eraser
function ClearFormattingIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* letter A */}
      <path
        d="M2.5 19.5 8.2 4.5 13.9 19.5M4.6 14.6h7.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* eraser */}
      <g transform="rotate(-42 17.2 16.6)">
        <rect x="11.6" y="13.4" width="11.2" height="6.4" rx="1.4" fill="#C026D3" />
        <rect x="11.6" y="13.4" width="4.6" height="6.4" rx="1.4" fill="#F0ABFC" />
      </g>
    </svg>
  );
}

const ToolbarDivider = () => <span className="mx-1 h-5 w-px shrink-0 bg-[#E2DDCF]" />;

interface ColorMenuProps {
  title: string;
  hint?: string;
  icon: React.ReactNode;
  barColor: string;
  active?: boolean;
  open: boolean;
  onToggle: () => void;
  onMainClick: () => void;
  palette: string[];
  selected: string;
  onPick: (color: string) => void;
  resetLabel: string;
  onReset: () => void;
}

// Word-style split button: main click applies the last colour, chevron opens the palette
function ColorMenu({
  title, hint, icon, barColor, active, open, onToggle, onMainClick,
  palette, selected, onPick, resetLabel, onReset,
}: ColorMenuProps) {
  return (
    <div className="relative flex items-center">
      <ToolbarBtn title={title} hint={hint} tooltip={!open} active={active} onClick={onMainClick} className="rounded-r-none">
        <span className="flex flex-col items-center leading-none">
          {icon}
          <span className="mt-[3px] h-[3px] w-4 rounded-sm" style={{ backgroundColor: barColor }} />
        </span>
      </ToolbarBtn>
      <ToolbarBtn title={`${title} options`} hint="Open the color palette" tooltip={!open} active={open} onClick={onToggle} variant="chevron" className="rounded-l-none">
        <ChevronDown size={12} />
      </ToolbarBtn>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-[248px] rounded-lg border border-[#D9D4C6] bg-white p-2.5 shadow-xl">
          <button
            type="button"
            onClick={onReset}
            className="mb-2 flex w-full items-center gap-2 rounded px-1.5 py-1 text-[11px] font-semibold text-[#1E2620] hover:bg-[#F1F0EA] cursor-pointer"
          >
            <span className="h-4 w-4 rounded-sm border border-[#D9D4C6] bg-[linear-gradient(135deg,#fff_44%,#E03131_44%,#E03131_56%,#fff_56%)]" />
            {resetLabel}
          </button>
          <div className="grid grid-cols-10 gap-1">
            {palette.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={c}
                onClick={() => onPick(c)}
                style={{ backgroundColor: c }}
                className={`h-[19px] w-[19px] rounded-sm border cursor-pointer transition-transform hover:scale-125 ${
                  selected.toLowerCase() === c.toLowerCase()
                    ? 'border-[#1E2620] ring-2 ring-[#3F6B4F]/40'
                    : 'border-black/10'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
      title="Select text to open the format toolbar (size, bold, italic, underline, colours, alignment, link, clear)"
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
  const [activeFormats, setActiveFormats] = useState<FormatState>(NO_FORMATS);
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const [lastTextColor, setLastTextColor] = useState<string>('#C22055');
  const [lastHighlightColor, setLastHighlightColor] = useState<string>(DEFAULT_HIGHLIGHT);
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

  // The API refuses "submit for review" once a story is approved or published
  const cannotSubmitStory = ["published", "approved"].includes(
    String(localStory.status || "").toLowerCase()
  );

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
    setActiveFormats(NO_FORMATS);
    setOpenMenu(null);
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
    setActiveFormats(getFormatState(range, startP));

    const rect = range.getBoundingClientRect();
    const width = Math.min(TOOLBAR_W, window.innerWidth - 16);
    const above = rect.top - TOOLBAR_H - 8;
    setToolbarPos({
      // Sit above the selection; flip below it when there is no room at the top
      top: above >= 8 ? above : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 8),
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

  // Push the paragraph's current DOM html into React state
  const commitParagraph = (paragraph: HTMLElement) => {
    const idx = Number(paragraph.dataset.blockIdx);
    if (!Number.isNaN(idx)) updateBlockText(idx, readHtml(paragraph));
  };

  // Restores the saved selection, runs an editing command, then syncs state
  const runEditCommand = (fn: (paragraph: HTMLElement) => void) => {
    const range = savedRangeRef.current;
    const paragraph = activeParagraphElRef.current;
    if (!range || !paragraph || !paragraph.isConnected) return;
    const selection = window.getSelection();
    if (!selection) return;

    paragraph.focus({ preventScroll: true });
    selection.removeAllRanges();
    selection.addRange(range);

    fn(paragraph);

    commitParagraph(paragraph);
    // Selection stays in place (like Word), so refresh the active-button states
    requestAnimationFrame(syncToolbarWithSelection);
  };

  // Bold / Italic / Underline / Strikethrough / Sub / Super / Align / Unlink / Clear
  const applyTextAction = (type: TextAction) => {
    setOpenMenu(null);
    runEditCommand((paragraph) => {
      switch (type) {
        case 'clear':
          // Word's "Clear All Formatting": removes bold/italic/underline/colour/highlight/size,
          // but keeps the text and any hyperlinks.
          convertLegacyMarks(paragraph);
          document.execCommand('removeFormat');
          break;
        case 'unlink':
          document.execCommand('unlink');
          break;
        case 'align-left':
        case 'align-center':
        case 'align-right':
        case 'align-justify':
          document.execCommand('styleWithCSS', false, 'true');
          document.execCommand(EXEC_COMMANDS[type]);
          document.execCommand('styleWithCSS', false, 'false');
          break;
        default: {
          // Bold / Italic / Underline / Strikethrough / Sub / Super: click again = undo
          const toggle = TOGGLE_FORMATS[type];
          const sel = window.getSelection();
          const wasOn =
            toggle && sel && sel.rangeCount > 0
              ? getFormatState(sel.getRangeAt(0), paragraph)[toggle.key]
              : false;
          const before = paragraph.innerHTML;

          document.execCommand('styleWithCSS', false, 'false'); // use <b>, <i>, <u>, <strike>
          document.execCommand(EXEC_COMMANDS[type]);           // toggles on/off like Word

          // Safety net: the format was on, the browser changed nothing → remove it ourselves
          if (toggle && wasOn && paragraph.innerHTML === before) {
            unwrapIntersecting(paragraph, toggle.selector);
          }
        }
      }
    });
  };

  // Font colour / highlight colour. `null` = remove (Automatic / No Color)
  const applyColor = (kind: 'text' | 'highlight', color: string | null) => {
    if (color) {
      if (kind === 'text') setLastTextColor(color);
      else setLastHighlightColor(color);
    }
    setOpenMenu(null);
    runEditCommand((paragraph) => {
      convertLegacyMarks(paragraph);
      document.execCommand('styleWithCSS', false, 'true');
      if (kind === 'text') {
        document.execCommand('foreColor', false, color ?? DEFAULT_TEXT_COLOR);
      } else {
        document.execCommand('hiliteColor', false, color ?? 'transparent');
      }
      document.execCommand('styleWithCSS', false, 'false');
    });
  };

  // Font size in px. execCommand only knows 1–7, so mark with size 7 and swap in real px spans.
  const applyFontSize = (px: number | null) => {
    setOpenMenu(null);
    runEditCommand((paragraph) => {
      document.execCommand('styleWithCSS', false, 'false');
      document.execCommand('fontSize', false, '7');

      const spans: HTMLElement[] = [];
      paragraph.querySelectorAll<HTMLElement>('font[size="7"]').forEach((f) => {
        const span = document.createElement('span');
        span.style.fontSize = `${px ?? Math.round(parseFloat(window.getComputedStyle(paragraph).fontSize))}px`;
        while (f.firstChild) span.appendChild(f.firstChild);
        // Inner spans with an older size would override the new one
        span.querySelectorAll<HTMLElement>('[style*="font-size"]').forEach((d) => {
          d.style.fontSize = '';
        });
        f.replaceWith(span);
        spans.push(span);
      });

      // Re-select the resized text so the toolbar stays open
      const selection = window.getSelection();
      if (selection && spans.length > 0) {
        const r = document.createRange();
        r.setStartBefore(spans[0]);
        r.setEndAfter(spans[spans.length - 1]);
        selection.removeAllRanges();
        selection.addRange(r);
      }
    });
  };

  // LINK (manual, because it needs a prompt)
  const applyLink = () => {
    const range = savedRangeRef.current;
    const paragraph = activeParagraphElRef.current;
    if (!range || !paragraph || !paragraph.isConnected) return;

    const startEl = range.commonAncestorContainer;
    const currentLink = (startEl instanceof Element ? startEl : startEl.parentElement)
      ?.closest('a') as HTMLAnchorElement | null;
    const url = window.prompt(
      "Enter destination URL for selected text:",
      currentLink ? currentLink.href : "https://"
    );
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
      commitParagraph(paragraph);
      hideToolbar();
      return;
    }

    const link = document.createElement('a');
    link.href = formattedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = formattedUrl;
    link.className = 'published-article-link';

    // MOVE the selected nodes into the link (keeps any existing formatting),
    // then drop the link back exactly where the selection was.
    const fragment = range.extractContents();
    // <a> inside <a> is invalid HTML and gets split by the parser
    fragment.querySelectorAll('a').forEach((a) => a.replaceWith(...Array.from(a.childNodes)));
    link.appendChild(fragment);
    range.insertNode(link);
    paragraph.normalize();

    // Sync React state FROM the DOM. Because EditableParagraph only writes to the
    // DOM when it differs from state, nothing gets rewritten and nothing moves.
    commitParagraph(paragraph);

    // Put the caret right after the link
    const selection = window.getSelection();
    if (selection) {
      const caret = document.createRange();
      caret.setStartAfter(link);
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

      if (submitForReview && !cannotSubmitStory) {
        try {
          await blogsApi.submitBlog(localStory._id, currentUserRole);
        } catch (submitErr) {
          // The changes are already saved above. If the API only says this status
          // can't be submitted, treat it as a normal save instead of an error.
          const notSubmittable =
            submitErr instanceof Error && /cannot submit a blog in/i.test(submitErr.message);
          if (!notSubmittable) throw submitErr;
        }
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

      {/* Floating Word-style Formatting Toolbar on Selection */}
      {toolbarPos && (
        <div
          style={{ top: toolbarPos.top, left: toolbarPos.left, width: TOOLBAR_W }}
          // Keeps the text selected while the toolbar is clicked
          onMouseDown={(e) => e.preventDefault()}
          className="fixed z-[100000] max-w-[calc(100vw-16px)] rounded-xl border border-[#D9D4C6] bg-white p-2 text-[#1E2620] shadow-[0_14px_36px_rgba(30,38,32,0.22)] animate-in fade-in duration-100"
        >
          {/* Row 1: size · B I U S · colours · clear */}
          <div className="flex flex-wrap items-center gap-0.5">
            <div className="relative">
              <ToolbarBtn
                title="Font Size"
                hint="Change the size of the selected text"
                tooltip={openMenu !== 'size'}
                active={openMenu === 'size'}
                onClick={() => setOpenMenu((m) => (m === 'size' ? null : 'size'))}
                className="w-[58px] gap-0.5"
              >
                <span className="w-6 text-center text-xs font-semibold tabular-nums">{activeFormats.fontSize}</span>
                <ChevronDown size={12} />
              </ToolbarBtn>
              {openMenu === 'size' && (
                <div className="absolute left-0 top-full z-10 mt-1.5 max-h-56 w-20 overflow-y-auto rounded-lg border border-[#D9D4C6] bg-white p-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => applyFontSize(null)}
                    className="mb-1 flex w-full items-center justify-center rounded border-b border-[#EDEAE0] px-2 py-1 text-[11px] font-semibold text-[#5A6259] hover:bg-[#F1F0EA] cursor-pointer"
                  >
                    Default
                  </button>
                  {FONT_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => applyFontSize(s)}
                      className={`flex w-full items-center justify-center rounded px-2 py-1 text-xs font-semibold tabular-nums cursor-pointer ${
                        String(s) === activeFormats.fontSize
                          ? 'bg-[#DCEBE1] text-[#2F5A40]'
                          : 'hover:bg-[#F1F0EA]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ToolbarDivider />

            <ToolbarBtn title="Bold (Ctrl+B)" hint="Make the selected text bold. Click again to remove" active={activeFormats.bold} onClick={() => applyTextAction('bold')}>
              <BoldIcon size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Italic (Ctrl+I)" hint="Slant the selected text. Click again to remove" active={activeFormats.italic} onClick={() => applyTextAction('italic')}>
              <ItalicIcon size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Underline (Ctrl+U)" hint="Draw a line under the selected text. Click again to remove" active={activeFormats.underline} onClick={() => applyTextAction('underline')}>
              <UnderlineIcon size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Strikethrough" hint="Draw a line through the selected text. Click again to remove" active={activeFormats.strike} onClick={() => applyTextAction('strike')}>
              <Strikethrough size={16} />
            </ToolbarBtn>

            <ToolbarDivider />

            <ColorMenu
              title="Font Color"
              hint="Change the text color. Click again to remove it, or use the arrow for more colors"
              icon={<span className="text-[15px] font-bold leading-none">A</span>}
              barColor={lastTextColor}
              active={activeFormats.color}
              open={openMenu === 'color'}
              onToggle={() => setOpenMenu((m) => (m === 'color' ? null : 'color'))}
              onMainClick={() => applyColor('text', activeFormats.color ? null : lastTextColor)}
              palette={TEXT_COLORS}
              selected={lastTextColor}
              onPick={(c) => applyColor('text', c)}
              resetLabel="Automatic"
              onReset={() => applyColor('text', null)}
            />
            <ColorMenu
              title="Text Highlight Color"
              hint="Highlight text like a marker. Click again to remove"
              icon={<Highlighter size={15} />}
              barColor={lastHighlightColor}
              active={activeFormats.highlight}
              open={openMenu === 'highlight'}
              onToggle={() => setOpenMenu((m) => (m === 'highlight' ? null : 'highlight'))}
              onMainClick={() => applyColor('highlight', activeFormats.highlight ? null : lastHighlightColor)}
              palette={HIGHLIGHT_COLORS}
              selected={lastHighlightColor}
              onPick={(c) => applyColor('highlight', c)}
              resetLabel="No Color"
              onReset={() => applyColor('highlight', null)}
            />

            <ToolbarDivider />

            <ToolbarBtn title="Clear All Formatting" hint="Remove bold, italic, color, size and highlight. Links stay" onClick={() => applyTextAction('clear')}>
              <ClearFormattingIcon size={19} />
            </ToolbarBtn>
          </div>

          {/* Row 2: sub/super · alignment · links */}
          <div className="mt-1.5 flex flex-wrap items-center gap-0.5 border-t border-[#EDEAE0] pt-1.5">
            <ToolbarBtn title="Subscript" hint="Small text below the line, like H₂O. Click again to remove" active={activeFormats.sub} onClick={() => applyTextAction('sub')}>
              <Subscript size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Superscript" hint="Small text above the line, like x². Click again to remove" active={activeFormats.sup} onClick={() => applyTextAction('sup')}>
              <Superscript size={16} />
            </ToolbarBtn>

            <ToolbarDivider />

            <ToolbarBtn title="Align Left" hint="Line up the text with the left edge. Click again to undo" active={activeFormats.align === 'left'} onClick={() => applyTextAction(activeFormats.align === 'left' ? 'align-justify' : 'align-left')}>
              <AlignLeft size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Center" hint="Center the text. Click again to undo" active={activeFormats.align === 'center'} onClick={() => applyTextAction(activeFormats.align === 'center' ? 'align-justify' : 'align-center')}>
              <AlignCenter size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Align Right" hint="Line up the text with the right edge. Click again to undo" active={activeFormats.align === 'right'} onClick={() => applyTextAction(activeFormats.align === 'right' ? 'align-justify' : 'align-right')}>
              <AlignRight size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Justify" hint="Align text to both left and right edges" active={activeFormats.align === 'justify'} onClick={() => applyTextAction('align-justify')}>
              <AlignJustify size={16} />
            </ToolbarBtn>

            <ToolbarDivider />

            <ToolbarBtn title="Insert Link" hint="Turn the selected text into a clickable link. On a link, edit its address" active={activeFormats.link} onClick={applyLink}>
              <LinkIcon size={16} />
            </ToolbarBtn>
            <ToolbarBtn title="Remove Link" hint="Turn the link back into plain text" onClick={() => applyTextAction('unlink')}>
              <Unlink size={16} />
            </ToolbarBtn>
          </div>
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
            {isSubmitting ? "Saving..." : cannotSubmitStory ? "Save Changes" : "Save Draft"}
          </button>
          {!cannotSubmitStory && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleUpdateStory(e, true)}
              className={btnGold}
            >
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {isSubmitting ? "Submitting..." : "Save & Submit"}
            </button>
          )}
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