'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fraunces, Inter, IBM_Plex_Mono } from '@/lib/fonts';
import { RotateCcw, ZoomIn, ZoomOut, Check, X, Loader2, Crop as CropIcon } from 'lucide-react';

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

/* ---------- types & helpers ---------- */

interface Rect { x: number; y: number; w: number; h: number }
interface Dim { w: number; h: number }
type HandleId = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function getMimeTypeFromSrc(imageSrc: string): string {
  const match = imageSrc.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

async function getCroppedImg(imageSrc: string, rect: Rect): Promise<string> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Failed to load image for cropping'));
  });

  const x = Math.round(rect.x);
  const y = Math.round(rect.y);
  const width = Math.max(1, Math.round(rect.w));
  const height = Math.max(1, Math.round(rect.h));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context found');

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  const mimeType = getMimeTypeFromSrc(imageSrc);
  return canvas.toDataURL(mimeType, 0.95);
}

/** Initial crop frame: 90% of the image, centered, honouring the aspect ratio. */
function initRect(nat: Dim, aspect?: number): Rect {
  const maxW = nat.w * 0.9;
  const maxH = nat.h * 0.9;
  let w = maxW;
  let h = maxH;
  if (aspect) {
    w = Math.min(maxW, maxH * aspect);
    h = w / aspect;
  }
  return { x: (nat.w - w) / 2, y: (nat.h - h) / 2, w, h };
}

/** Word-style resize of the crop frame from one of its 8 handles (all values in natural image px). */
function resizeRect(
  r0: Rect,
  handle: HandleId,
  dx: number,
  dy: number,
  aspect: number | undefined,
  nat: Dim,
  min: number
): Rect {
  const L0 = r0.x;
  const T0 = r0.y;
  const R0 = r0.x + r0.w;
  const B0 = r0.y + r0.h;
  const hasW = handle.includes('w');
  const hasE = handle.includes('e');
  const hasN = handle.includes('n');
  const hasS = handle.includes('s');

  // Free resize
  if (!aspect) {
    let l = L0, t = T0, r = R0, b = B0;
    if (hasW) l = clamp(L0 + dx, 0, R0 - min);
    if (hasE) r = clamp(R0 + dx, L0 + min, nat.w);
    if (hasN) t = clamp(T0 + dy, 0, B0 - min);
    if (hasS) b = clamp(B0 + dy, T0 + min, nat.h);
    return { x: l, y: t, w: r - l, h: b - t };
  }

  const minW = Math.max(min, min * aspect);

  // Locked aspect, corner handle: opposite corner stays anchored
  if (handle.length === 2) {
    const sx = hasW ? -1 : 1;
    const sy = hasN ? -1 : 1;
    const ax = hasW ? R0 : L0;
    const ay = hasN ? B0 : T0;
    const rawW = r0.w + sx * dx;
    const rawH = r0.h + sy * dy;
    const wanted = Math.max(rawW, rawH * aspect);
    const maxW = Math.min(sx > 0 ? nat.w - ax : ax, (sy > 0 ? nat.h - ay : ay) * aspect);
    const w = clamp(wanted, minW, maxW);
    const h = w / aspect;
    return { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, w, h };
  }

  // Locked aspect, left/right edge: opposite edge anchored, grows around vertical center
  if (hasE || hasW) {
    const sx = hasW ? -1 : 1;
    const ax = hasW ? R0 : L0;
    const cy = T0 + r0.h / 2;
    const maxH = 2 * Math.min(cy, nat.h - cy);
    const maxW = Math.min(sx > 0 ? nat.w - ax : ax, maxH * aspect);
    const w = clamp(r0.w + sx * dx, minW, maxW);
    const h = w / aspect;
    return { x: sx > 0 ? ax : ax - w, y: cy - h / 2, w, h };
  }

  // Locked aspect, top/bottom edge: opposite edge anchored, grows around horizontal center
  const sy = hasN ? -1 : 1;
  const ay = hasN ? B0 : T0;
  const cx = L0 + r0.w / 2;
  const maxW = 2 * Math.min(cx, nat.w - cx);
  const maxH = Math.min(sy > 0 ? nat.h - ay : ay, maxW / aspect);
  const h = clamp(r0.h + sy * dy, minW / aspect, maxH);
  const w = h * aspect;
  return { x: cx - w / 2, y: sy > 0 ? ay : ay - h, w, h };
}

const HANDLES: { id: HandleId; left: string; top: string; cursor: string }[] = [
  { id: 'nw', left: '0%', top: '0%', cursor: 'nwse-resize' },
  { id: 'n', left: '50%', top: '0%', cursor: 'ns-resize' },
  { id: 'ne', left: '100%', top: '0%', cursor: 'nesw-resize' },
  { id: 'e', left: '100%', top: '50%', cursor: 'ew-resize' },
  { id: 'se', left: '100%', top: '100%', cursor: 'nwse-resize' },
  { id: 's', left: '50%', top: '100%', cursor: 'ns-resize' },
  { id: 'sw', left: '0%', top: '100%', cursor: 'nesw-resize' },
  { id: 'w', left: '0%', top: '50%', cursor: 'ew-resize' },
];

const MIN_CROP_SCREEN_PX = 40;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const MIN_MODAL_W = 360;
const MIN_MODAL_H = 460;

/* ---------- component ---------- */

interface CropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImageBase64: string) => void;
  aspectRatio?: number;
  circular?: boolean;
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  aspectRatio,
  circular = false,
}: CropperModalProps) {
  const lockedAspect = circular ? 1 : aspectRatio;

  const [currentAspect, setCurrentAspect] = useState<number | undefined>(lockedAspect);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState<Rect | null>(null);
  const [nat, setNat] = useState<Dim | null>(null);
  const [stage, setStage] = useState<Dim>({ w: 0, h: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [safeImageSrc, setSafeImageSrc] = useState<string>('');
  const [modalSize, setModalSize] = useState<Dim | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentAspect(lockedAspect);
  }, [lockedAspect]);

  /* Load a CORS-safe copy of the image */
  useEffect(() => {
    let active = true;
    let objectUrl = '';

    if (imageSrc && imageSrc.startsWith('http')) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          if (active) {
            objectUrl = URL.createObjectURL(blob);
            setSafeImageSrc(objectUrl);
          }
        })
        .catch(() => {
          if (active) setSafeImageSrc(imageSrc);
        });
    } else {
      setSafeImageSrc(imageSrc);
    }

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageSrc]);

  /* Read natural size and create the first crop frame */
  useEffect(() => {
    if (!safeImageSrc) return;
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (!active) return;
      const dim = { w: img.naturalWidth, h: img.naturalHeight };
      setNat(dim);
      setRect(initRect(dim, currentAspect));
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = safeImageSrc;
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeImageSrc]);

  /* Keep track of the stage size so the card is fully dynamic */
  useEffect(() => {
    if (!isOpen) return;
    const el = stageRef.current;
    if (!el) return;
    const update = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, nat]);

  /* Mouse wheel / trackpad zoom (native listener so we can preventDefault) */
  useEffect(() => {
    if (!isOpen) return;
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => clamp(z - e.deltaY * 0.001, MIN_ZOOM, MAX_ZOOM));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen, nat]);

  /* Geometry: crop frame lives in natural-image px, drawn through scale + origin */
  const fit = nat && stage.w && stage.h
    ? Math.min((stage.w - 32) / nat.w, (stage.h - 32) / nat.h)
    : 1;
  const scale = Math.max(0.01, fit) * zoom;
  const originX = nat ? stage.w / 2 + pan.x - (nat.w * scale) / 2 : 0;
  const originY = nat ? stage.h / 2 + pan.y - (nat.h * scale) / 2 : 0;

  const beginDrag = useCallback(
    (e: React.PointerEvent, mode: 'pan' | 'move' | HandleId) => {
      if (!nat || !rect) return;
      e.preventDefault();
      e.stopPropagation();

      const start = { x: e.clientX, y: e.clientY };
      const r0 = { ...rect };
      const p0 = { ...pan };
      const s = scale;
      const min = MIN_CROP_SCREEN_PX / s;

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (mode === 'pan') {
          setPan({ x: p0.x + dx, y: p0.y + dy });
        } else if (mode === 'move') {
          setRect({
            ...r0,
            x: clamp(r0.x + dx / s, 0, nat.w - r0.w),
            y: clamp(r0.y + dy / s, 0, nat.h - r0.h),
          });
        } else {
          setRect(resizeRect(r0, mode, dx / s, dy / s, currentAspect, nat, min));
        }
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [nat, rect, pan, scale, currentAspect]
  );

  /* Resize the whole card from its bottom-right grip (grows from the center, so double the delta) */
  const beginModalResize = (e: React.PointerEvent) => {
    const el = modalRef.current;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    const box = el.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY };
    const move = (ev: PointerEvent) => {
      setModalSize({
        w: clamp(box.width + 2 * (ev.clientX - start.x), MIN_MODAL_W, window.innerWidth * 0.96),
        h: clamp(box.height + 2 * (ev.clientY - start.y), MIN_MODAL_H, window.innerHeight * 0.96),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCurrentAspect(lockedAspect);
    if (nat) setRect(initRect(nat, lockedAspect));
  };

  const handleAspectChange = (aspect: number | undefined) => {
    setCurrentAspect(aspect);
    if (nat) {
      setRect(aspect === undefined && rect ? rect : initRect(nat, aspect));
    }
  };

  const handleSave = async () => {
    if (!rect || !safeImageSrc) return;

    try {
      setIsProcessing(true);
      const result = await getCroppedImg(safeImageSrc, rect);
      onSave(result);
      onClose();
    } catch (err) {
      console.error('Cropping error:', err);
      alert('Could not crop image.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: "var(--font-body)" };
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  const presetBtn = (label: string, value: number | undefined) => (
    <button
      type="button"
      onClick={() => handleAspectChange(value)}
      className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
        currentAspect === value
          ? 'bg-slate-900 text-white shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`${fontVars} fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200`}
      style={bodyFont}
    >
      <div
        ref={modalRef}
        className="relative flex w-[min(96vw,760px)] h-[min(92vh,720px)] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        style={
          modalSize
            ? { width: modalSize.w, height: modalSize.h, maxWidth: '96vw', maxHeight: '96vh' }
            : undefined
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CropIcon size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight" style={displayFont}>
                Crop & Align Image
              </h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500" style={monoFont}>
                Drag the handles to resize the crop, drag inside to move it
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
          {/* Crop stage: fills all available space and follows the card size */}
          <div
            ref={stageRef}
            onPointerDown={(e) => beginDrag(e, 'pan')}
            className="relative min-h-[220px] flex-1 touch-none select-none overflow-hidden rounded-xl bg-[#FDFCFA] cursor-grab active:cursor-grabbing"
          >
            {safeImageSrc && nat && rect && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={safeImageSrc}
                  alt="Image to crop"
                  draggable={false}
                  className="pointer-events-none absolute max-w-none select-none"
                  style={{
                    left: originX,
                    top: originY,
                    width: nat.w * scale,
                    height: nat.h * scale,
                  }}
                />

                {/* Crop frame (dims everything outside via a huge box-shadow) */}
                <div
                  onPointerDown={(e) => beginDrag(e, 'move')}
                  className={`absolute cursor-move border-2 border-emerald-600 ${circular ? 'rounded-full' : ''}`}
                  style={{
                    left: originX + rect.x * scale,
                    top: originY + rect.y * scale,
                    width: rect.w * scale,
                    height: rect.h * scale,
                    boxShadow: '0 0 0 9999px rgba(253, 252, 250, 0.8)',
                  }}
                >
                  {/* Rule-of-thirds grid */}
                  {!circular && (
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-y-0 left-1/3 w-px bg-emerald-600/40" />
                      <div className="absolute inset-y-0 left-2/3 w-px bg-emerald-600/40" />
                      <div className="absolute inset-x-0 top-1/3 h-px bg-emerald-600/40" />
                      <div className="absolute inset-x-0 top-2/3 h-px bg-emerald-600/40" />
                    </div>
                  )}

                  {/* 8 resize handles, like Word's crop tool */}
                  {HANDLES.map((h) => (
                    <div
                      key={h.id}
                      onPointerDown={(e) => beginDrag(e, h.id)}
                      className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                      style={{ left: h.left, top: h.top, cursor: h.cursor }}
                    >
                      <span className="block h-2.5 w-2.5 rounded-[2px] border border-emerald-600 bg-white shadow" />
                    </div>
                  ))}
                </div>

                {/* Live size readout */}
                <span
                  className="pointer-events-none absolute left-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={monoFont}
                >
                  {Math.round(rect.w)} × {Math.round(rect.h)} px
                </span>
              </>
            )}

            {(!safeImageSrc || !nat) && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}
          </div>

          {/* Aspect presets */}
          {!circular && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500" style={monoFont}>
                Preset Aspect
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {presetBtn('Free / Custom', undefined)}
                {presetBtn('16:9 Banner', 16 / 9)}
                {presetBtn('4:3 Standard', 4 / 3)}
                {presetBtn('1:1 Square', 1)}
              </div>
            </div>
          )}

          {/* Zoom (view only: zoom in/out to make the handles easier to reach) */}
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex shrink-0 items-center gap-1.5 text-slate-500">
              <ZoomOut size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={monoFont}>Zoom</span>
            </div>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
            />
            <ZoomIn size={14} className="shrink-0 text-slate-500" />
            <button
              type="button"
              onClick={handleReset}
              title="Reset frame"
              className="shrink-0 rounded-lg border border-transparent p-1.5 text-slate-500 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing || !rect}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Apply Crop</span>
              </>
            )}
          </button>
        </div>

        {/* Card resize grip (bottom-right) */}
        <div
          onPointerDown={beginModalResize}
          title="Drag to resize this window"
          className="absolute bottom-0 right-0 z-10 flex h-5 w-5 cursor-nwse-resize touch-none items-end justify-end p-1"
        >
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-slate-400" aria-hidden="true">
            <path d="M9 1L1 9M9 5L5 9M9 8.5L8.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}