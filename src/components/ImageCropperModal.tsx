'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { RotateCcw, ZoomIn, Check, X } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Crop & Align Image</h3>
            <p className="text-xs text-slate-500 font-medium">Position, zoom, or adjust aspect ratio</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative w-full h-72 bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
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

        {!circular && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">Preset Ratio:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentAspect(16 / 9)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  currentAspect === 16 / 9 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                16:9 Banner
              </button>
              <button
                type="button"
                onClick={() => setCurrentAspect(4 / 3)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  currentAspect === 4 / 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                4:3 Card
              </button>
              <button
                type="button"
                onClick={() => setCurrentAspect(1)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  currentAspect === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                1:1 Square
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 shrink-0">
            <ZoomIn size={16} />
            <span className="text-xs font-semibold">Zoom</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition shrink-0"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 text-sm"
          >
            {isProcessing ? 'Applying...' : <><Check size={16} /> Apply Crop</>}
          </button>
        </div>
      </div>
    </div>
  );
}