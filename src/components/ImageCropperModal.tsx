'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Hidden canvas calculation helper
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

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

  return canvas.toDataURL('image/jpeg');
}

interface CropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImageBase64: string) => void;
  aspectRatio?: number; // 1 for square, 1.77 (16:9) for landscape cards
  circular?: boolean;    // true for user profiles, false for article cards
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  aspectRatio = 1,
  circular = false,
}: CropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (croppedAreaPixels && imageSrc) {
      const result = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(result); // Pass the cropped image back to the parent file
      onClose();      // Close the modal
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col items-center">
        <h3 className="text-lg font-bold text-[#1B3A5C] mb-4">Adjust Your Image</h3>
        
        {/* The active viewport */}
        <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={circular ? 'round' : 'rect'}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom Control */}
        <div className="w-full flex items-center gap-3 mt-5">
          <span className="text-xs font-semibold text-slate-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E8185A]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#1B3A5C] text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}