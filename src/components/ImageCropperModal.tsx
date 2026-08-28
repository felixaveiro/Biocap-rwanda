'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { RotateCcw, ZoomIn, Check, X, Loader2, Crop as CropIcon } from 'lucide-react';

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

function getMimeTypeFromSrc(imageSrc: string): string {
  const match = imageSrc.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Failed to load image for cropping'));
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context found');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const mimeType = getMimeTypeFromSrc(imageSrc);
  return canvas.toDataURL(mimeType, 0.95);
}

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
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(aspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [safeImageSrc, setSafeImageSrc] = useState<string>('');

  useEffect(() => {
    setCurrentAspect(aspectRatio);
  }, [aspectRatio]);

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

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCurrentAspect(aspectRatio);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || !safeImageSrc) return;

    try {
      setIsProcessing(true);
      const result = await getCroppedImg(safeImageSrc, croppedAreaPixels);
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

  return (
    <div 
      className={`${fontVars} fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto`}
      style={bodyFont}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        
        {/* Header - Compact */}
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
                Drag handles to adjust visible framing
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

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Crop Canvas - Height adaptively capped at 320px so controls remain visible */}
          <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
            {safeImageSrc && (
              <Cropper
                image={safeImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={currentAspect}
                cropShape={circular ? 'round' : 'rect'}
                showGrid={true}
                mediaProps={{ style: { objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' } }}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* Aspect Ratio Presets */}
          {!circular && (
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500" style={monoFont}>
                Preset Aspect
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setCurrentAspect(undefined)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentAspect === undefined 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  Free / Custom
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentAspect(16 / 9)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentAspect === 16 / 9 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  16:9 Banner
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentAspect(4 / 3)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentAspect === 4 / 3 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  4:3 Standard
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentAspect(1)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentAspect === 1 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  1:1 Square
                </button>
              </div>
            </div>
          )}

          {/* Zoom Slider */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
              <ZoomIn size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={monoFont}>Zoom</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <button
              type="button"
              onClick={handleReset}
              title="Reset frame"
              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

        </div>

        {/* Footer - Always Sticky at Bottom */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3 shrink-0">
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
            disabled={isProcessing}
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

      </div>
    </div>
  );
}