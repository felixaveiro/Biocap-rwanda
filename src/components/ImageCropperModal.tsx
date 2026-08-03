'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';

/**
 * Dynamically extracts MIME type from Data URL (defaults to image/jpeg)
 */
function getMimeTypeFromSrc(imageSrc: string): string {
  const match = imageSrc.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

/**
 * Calculates cropped image region on a hidden canvas
 */
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image();
  image.crossOrigin = 'anonymous'; // Enable CORS for remote assets (Cloudinary)
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [safeImageSrc, setSafeImageSrc] = useState<string>('');

  // Convert remote HTTP Cloudinary URLs to local Blob URLs to prevent canvas CORS security errors
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

  const handleSave = async () => {
    if (!croppedAreaPixels || !safeImageSrc) return;

    try {
      setIsProcessing(true);
      const result = await getCroppedImg(safeImageSrc, croppedAreaPixels);

      // 1. Send cropped base64 result to parent
      onSave(result);

      // 2. Force close the cropper modal
      onClose();
    } catch (err) {
      console.error('Cropping error:', err);
      alert('Could not crop image. Check network connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col items-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Adjust & Align Cover Image</h3>

        {/* Interactive Cropper Viewport */}
        <div className="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden shadow-inner">
          {safeImageSrc && (
            <Cropper
              image={safeImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              cropShape={circular ? 'round' : 'rect'}
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        {/* Zoom Control */}
        <div className="w-full flex items-center gap-3 mt-5">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
          >
            {isProcessing ? 'Applying...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}