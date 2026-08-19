'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { RotateCcw, ZoomIn, Check, X, Loader2 } from 'lucide-react';

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
  aspectRatio = 16 / 9,
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
    <div className={`${fontVars} fixed inset-0 z-50 flex items-center justify-center bg-[#1E2620]/80 p-4 backdrop-blur-md animate-in fade-in duration-200`} style={bodyFont}>
      <div className="relative w-full max-w-xl border border-[#E2DDCF] bg-white p-6 sm:p-7 shadow-2xl transition-all">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#EDEAE0] pb-4 mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7268]" style={monoFont}>
              Image Framing & Alignment
            </p>
            <h3 className="text-xl italic text-[#1E2620] mt-0.5" style={displayFont}>
              Adjust Manuscript Image
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8B9188] hover:text-[#1E2620] hover:bg-[#FAF9F5] border border-transparent hover:border-[#D9D4C6] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cropper Viewport Container */}
        <div className="relative w-full h-72 bg-[#1E2620] border border-[#D9D4C6] overflow-hidden shadow-inner">
          {safeImageSrc && (
            <Cropper
              image={safeImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={currentAspect}
              cropShape={circular ? 'round' : 'rect'}
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        {/* Aspect Ratio Presets */}
        {!circular && (
          <div className="mt-4 flex items-center justify-between gap-2 border-b border-[#EDEAE0] pb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
              Preset Aspect
            </span>
            <div className="inline-flex border border-[#D9D4C6]">
              <button
                type="button"
                onClick={() => setCurrentAspect(16 / 9)}
                className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                  currentAspect === 16 / 9 ? 'bg-[#1E2620] text-white' : 'bg-white text-[#5A6259] hover:bg-[#FAF9F5]'
                }`}
              >
                16:9 Banner
              </button>
              <button
                type="button"
                onClick={() => setCurrentAspect(4 / 3)}
                className={`border-l border-[#D9D4C6] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                  currentAspect === 4 / 3 ? 'bg-[#1E2620] text-white' : 'bg-white text-[#5A6259] hover:bg-[#FAF9F5]'
                }`}
              >
                4:3 Standard
              </button>
              <button
                type="button"
                onClick={() => setCurrentAspect(1)}
                className={`border-l border-[#D9D4C6] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors cursor-pointer ${
                  currentAspect === 1 ? 'bg-[#1E2620] text-white' : 'bg-white text-[#5A6259] hover:bg-[#FAF9F5]'
                }`}
              >
                1:1 Square
              </button>
            </div>
          </div>
        )}

        {/* Zoom Controls Bar */}
        <div className="mt-4 flex items-center gap-4 border border-[#D9D4C6] bg-[#FAF9F5] p-3">
          <div className="flex items-center gap-1.5 text-[#5A6259] shrink-0">
            <ZoomIn size={15} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={monoFont}>Zoom</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1.5 bg-[#D9D4C6] appearance-none cursor-pointer accent-[#3F6B4F]"
          />
          <button
            type="button"
            onClick={handleReset}
            title="Reset alignment"
            className="p-1.5 text-[#5A6259] hover:text-[#1E2620] hover:bg-white border border-transparent hover:border-[#D9D4C6] transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#EDEAE0]">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 border border-[#D9D4C6] bg-white text-[#3A4239] hover:border-[#1E2620] text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#1E2620] bg-[#1E2620] text-[#F3F2ED] hover:bg-[#3F6B4F] hover:border-[#3F6B4F] text-xs font-semibold uppercase tracking-wide transition-colors cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin text-[#8FBF9F]" />
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