'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { Poppins } from 'next/font/google';
import { galleryApi } from '@/lib/api/gallery';
import {
  getBioCapFilename,
  generateImageReferenceId,
  triggerBrowserDownload,
} from '@/lib/utils/Biocapfilename';
import {
  X,
  UploadCloud,
  FolderPlus,
  Video,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Film,
  FolderUp,
  FileImage,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Tag,
  Star,
  Download,
  MessageSquareText,
} from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_CLOUDINARY_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_COMPRESSED_IMAGE_BYTES = 9.5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 3840;
const MAX_GALLERY_IMAGES = 20;

const prepareImageForUpload = async (file: File): Promise<File> => {
  if (file.size <= MAX_CLOUDINARY_IMAGE_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  try {
    let scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const qualities = [0.9, 0.82, 0.75, 0.68, 0.6];

    while (scale >= 0.1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('This browser could not prepare the image for upload.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of qualities) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/webp', quality)
        );
        if (!blob || blob.type !== 'image/webp') {
          throw new Error('This browser cannot convert oversized images to WebP.');
        }
        if (blob.size <= MAX_COMPRESSED_IMAGE_BYTES) {
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
          return new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: file.lastModified,
          });
        }
      }

      scale *= 0.85;
    }

    throw new Error(`Could not reduce "${file.name}" below the 9.5 MiB target size.`);
  } finally {
    bitmap.close();
  }
};

export default function GalleryUploadModal({ isOpen, onClose, onSuccess }: Props) {
  // Step 1 = Details & File Upload Form | Step 2 = Live Preview Display
  const [step, setStep] = useState<1 | 2>(1);

  const [mediaType, setMediaType] = useState<'folder' | 'video'>('folder');
  const [imageSelectionMode, setImageSelectionMode] = useState<'files' | 'directory'>('files');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'activities' | 'events' | 'team'>('activities');
  const [caption, setCaption] = useState('');

  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // Index (within `images`) of the image the user explicitly chose as cover.
  // null = nothing chosen yet (no default is applied)
  const [coverIndex, setCoverIndex] = useState<number | null>(null);

  // Per-image, OPTIONAL caption — parallel array to `images` (same index).
  const [imageCaptions, setImageCaptions] = useState<string[]>([]);
  // Per-image stable reference id — also parallel to `images`. Generated
  // client-side the moment a file is selected, used both for the
  // download filename below and sent to the backend on submit so the
  // same id can be reused later (e.g. by the public gallery page).
  const [imageRefIds, setImageRefIds] = useState<string[]>([]);

  // Local object URLs generated for instant Step 2 preview
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Clean up Object URLs when files change or component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [imagePreviews, videoPreviewUrl, thumbnailPreviewUrl]);

  if (!isOpen) return null;

  // Clears the selected images and resets the cover choice, captions & ids
  const resetImages = () => {
    setImages([]);
    setImagePreviews([]);
    setCoverIndex(null);
    setImageCaptions([]);
    setImageRefIds([]);
  };

  // Handle image files and directory selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const validImages = selectedFiles.filter((file) => file.type.startsWith('image/'));

    if (validImages.length === 0) {
      setModalError('No valid image files found in your selection.');
      resetImages();
      return;
    }

    if (validImages.length > MAX_GALLERY_IMAGES) {
      e.target.value = '';
      setModalError(`A gallery collection can contain at most ${MAX_GALLERY_IMAGES} images. You selected ${validImages.length}.`);
      return;
    }

    setModalError(null);
    setImages(validImages);
    setCoverIndex(null); // user must pick the cover themselves

    // Create instant browser preview URLs for step 2
    const previewUrls = validImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);

    // Fresh, empty (optional) captions and a stable reference id per image
    setImageCaptions(validImages.map(() => ''));
    setImageRefIds(validImages.map(() => generateImageReferenceId()));
  };

  // Update a single image's optional caption without touching the others
  const handleCaptionChange = (index: number, value: string) => {
    setImageCaptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Downloads one image using the BioCap naming rule:
  //   has caption -> BioCap-<slug-of-caption>-<referenceId>.<ext>
  //   no caption  -> BioCap-image-<referenceId>.<ext>
  const handleDownloadImage = (index: number) => {
    const url = imagePreviews[index];
    const file = images[index];
    if (!url || !file) return;

    const filename = getBioCapFilename({
      caption: imageCaptions[index],
      referenceId: imageRefIds[index],
      originalFileName: file.name,
    });

    triggerBrowserDownload(url, filename);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideo(file);
    if (file) {
      setVideoPreviewUrl(URL.createObjectURL(file));
    } else {
      setVideoPreviewUrl(null);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnail(file);
    if (file) {
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    } else {
      setThumbnailPreviewUrl(null);
    }
  };

  // Validate form fields before switching to Step 2 Live Preview
  const handleProceedToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!title.trim()) {
      setModalError('Please enter an archive entry title.');
      return;
    }

    if (!caption.trim()) {
      setModalError('Please enter a caption or archival description.');
      return;
    }

    if (mediaType === 'folder' && images.length === 0) {
      setModalError('Please select at least one image file or folder.');
      return;
    }

    if (mediaType === 'folder' && coverIndex === null) {
      setModalError('Please click one of your images to choose the collection cover.');
      return;
    }

    if (mediaType === 'video') {
      if (!video) {
        setModalError('Please attach an MP4/MOV video file.');
        return;
      }
      if (!thumbnail) {
        setModalError('Please attach a video cover thumbnail image.');
        return;
      }
    }

    setStep(2);
  };

  // Submit form data to backend API
  const handleSubmit = async () => {
    setModalError(null);
    setIsSubmitting(true);
    setSubmitStatus('Preparing images...');

    try {
      const formData = new FormData();
      formData.append('mediaType', mediaType);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('caption', caption);

      if (mediaType === 'folder') {
        for (let index = 0; index < images.length; index += 1) {
          setSubmitStatus(`Preparing image ${index + 1} of ${images.length}...`);
          formData.append('images', await prepareImageForUpload(images[index]));
        }
        // Tells the backend which uploaded image (0-based) is the collection cover
        if (coverIndex !== null) formData.append('coverIndex', String(coverIndex));
        // Per-image optional captions and stable reference ids, in the
        // same order as the `images` files above, so the backend can
        // zip them back together (index i <-> images[i]).
        formData.append('imageCaptions', JSON.stringify(imageCaptions));
        formData.append('imageReferenceIds', JSON.stringify(imageRefIds));
      } else if (mediaType === 'video') {
        if (video) formData.append('video', video);
        if (thumbnail) {
          setSubmitStatus('Preparing thumbnail...');
          formData.append('thumbnail', await prepareImageForUpload(thumbnail));
        }
      }

      setSubmitStatus('Uploading...');
      await galleryApi.createItem(formData);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to submit gallery upload modal:', err);
      const message = err instanceof Error ? err.message : 'Failed to upload media files.';
      setModalError(message);
    } finally {
      setIsSubmitting(false);
      setSubmitStatus('');
    }
  };

  // Reusable clickable grid: click an image to make it the cover, type an
  // optional caption for it, and (in Step 2) download it under its final
  // BioCap-formatted filename.
  const renderCoverPicker = (maxHeightClass: string, allowDownload: boolean) => (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${maxHeightClass} overflow-y-auto p-2 border border-[#00A859]/20 bg-white`}
    >
      {imagePreviews.map((src, index) => {
        const isCover = index === coverIndex;
        return (
          <div
            key={index}
            className={`flex flex-col overflow-hidden bg-[#0C1E12] transition-all ${
              isCover
                ? 'border-2 border-[#E5B800] ring-2 ring-[#E5B800]/40'
                : 'border border-[#00A859]/20 hover:border-[#00A859]'
            }`}
          >
            {/* Click the image itself to set it as the cover */}
            <button
              type="button"
              onClick={() => setCoverIndex(index)}
              aria-pressed={isCover}
              aria-label={isCover ? `Image ${index + 1} (current cover)` : `Set image ${index + 1} as cover`}
              className="relative aspect-square w-full overflow-hidden group cursor-pointer"
            >
              <Image
                src={src}
                alt={`Upload preview ${index + 1}`}
                width={800}
                height={800}
                unoptimized
                className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                  isCover ? 'brightness-100' : 'brightness-90'
                }`}
              />
              {isCover ? (
                <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 bg-[#E5B800] text-[#0C1E12] text-[8px] font-mono font-bold uppercase px-1.5 py-0.5">
                  <Star size={9} fill="currentColor" /> Cover
                </span>
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-[#0C1E12]/60 text-white text-[9px] font-mono font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Set as cover
                </span>
              )}
              <span className="absolute bottom-1 right-1 bg-[#0C1E12]/80 text-white text-[8px] font-mono px-1 py-0.5">
                #{index + 1}
              </span>
            </button>

            {/* Optional per-image caption */}
            <div className="flex items-center gap-1 bg-white px-1.5 py-1 border-t border-[#00A859]/15">
              <MessageSquareText size={11} className="shrink-0 text-[#5A6259]" />
              <input
                type="text"
                value={imageCaptions[index] ?? ''}
                onChange={(e) => handleCaptionChange(index, e.target.value)}
                placeholder="Optional caption"
                className="w-full min-w-0 text-[10px] text-[#0C1E12] placeholder-[#5A6259]/50 focus:outline-none"
              />
            </div>

            {/* Reference id + optional download (Step 2 only) */}
            <div className="flex items-center justify-between gap-1 bg-[#FAF9F6] px-1.5 py-1 border-t border-[#00A859]/10">
              <span className="truncate text-[8px] font-mono text-[#5A6259]" title={imageRefIds[index]}>
                ID: {imageRefIds[index]}
              </span>
              {allowDownload && (
                <button
                  type="button"
                  onClick={() => handleDownloadImage(index)}
                  aria-label={`Download image ${index + 1}`}
                  title="Download with BioCap filename"
                  className="shrink-0 text-[#00A859] hover:text-[#008A47] cursor-pointer"
                >
                  <Download size={12} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return createPortal(
    <div
      className={`${poppins.className} fixed inset-0 z-[9999] flex items-center justify-center bg-[#0C1E12]/80 p-4 backdrop-blur-xs animate-in fade-in duration-150 selection:bg-[#E5B800] selection:text-[#0C1E12]`}
    >
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden border border-[#00A859]/30 bg-white text-[#0C1E12] shadow-2xl rounded-sm">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#00A859]/20 bg-[#FAF9F6] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="border border-[#00A859]/30 bg-white p-2 text-[#00A859] rounded-xs">
              <UploadCloud size={18} />
            </div>
            <div>
              <p className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-[#E5B800]">
                BIOCAP COLLECTION PORTAL
              </p>
              <h3 className="text-base sm:text-lg font-semibold text-[#0C1E12]">
                {step === 1 ? 'Upload BioCap Collection or Video' : 'Collection Preview Before Publish'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="border border-[#00A859]/30 bg-white p-1.5 text-[#0C1E12] hover:bg-[#00A859] hover:text-white transition-colors cursor-pointer rounded-xs"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center border-b border-[#00A859]/15 bg-white text-xs font-mono">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex-1 py-2 px-4 text-center border-r border-[#00A859]/15 font-bold transition-colors cursor-pointer ${
              step === 1 ? 'bg-[#00A859]/10 text-[#00A859]' : 'text-[#5A6259]'
            }`}
          >
            1. Collection Details
          </button>
          <div
            className={`flex-1 py-2 px-4 text-center font-bold transition-colors ${
              step === 2 ? 'bg-[#00A859]/10 text-[#00A859]' : 'text-[#5A6259]'
            }`}
          >
            2. Preview &amp; Publish
          </div>
        </div>

        {/* Modal Error Banner */}
        {modalError && (
          <div className="flex items-center gap-3 border-b border-red-500 bg-red-50 px-6 py-3 shrink-0">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <p className="text-xs font-semibold text-red-950">{modalError}</p>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ── STEP 1: FORM INPUTS ────────────────────────────────────────── */}
          {step === 1 && (
            <form id="gallery-upload-form" onSubmit={handleProceedToPreview} className="space-y-6">
              
              {/* Content Type Switcher */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C1E12]">
                  Select Content Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('folder');
                      setVideo(null);
                      setThumbnail(null);
                      setVideoPreviewUrl(null);
                      setThumbnailPreviewUrl(null);
                    }}
                    className={`flex items-center gap-3 p-3 border transition-all cursor-pointer text-left ${
                      mediaType === 'folder'
                        ? 'border-[#00A859] bg-[#00A859]/10 text-[#0C1E12] font-semibold'
                        : 'border-[#00A859]/20 bg-white text-[#5A6259] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <FolderPlus size={18} className={mediaType === 'folder' ? 'text-[#00A859]' : 'text-[#5A6259]'} />
                    <div>
                      <p className="text-xs font-semibold">Image Collection</p>
                      <p className="text-[10px] text-[#5A6259]">Multiple images or folder</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('video');
                      resetImages();
                    }}
                    className={`flex items-center gap-3 p-3 border transition-all cursor-pointer text-left ${
                      mediaType === 'video'
                        ? 'border-[#E5B800] bg-[#E5B800]/15 text-[#0C1E12] font-semibold'
                        : 'border-[#00A859]/20 bg-white text-[#5A6259] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <Video size={18} className={mediaType === 'video' ? 'text-[#E5B800]' : 'text-[#5A6259]'} />
                    <div>
                      <p className="text-xs font-semibold">HD Video Entry</p>
                      <p className="text-[10px] text-[#5A6259]">MP4/MOV with cover image</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C1E12]">
                  Archive Entry Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#00A859]/30 bg-white p-2.5 text-xs text-[#0C1E12] placeholder-[#5A6259]/50 focus:border-[#00A859] focus:outline-none rounded-xs"
                  placeholder="e.g. Rubona station workshop"
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C1E12]">
                  Target Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'activities' | 'events' | 'team')}
                  className="w-full border border-[#00A859]/30 bg-white p-2.5 text-xs text-[#0C1E12] focus:border-[#00A859] focus:outline-none rounded-xs cursor-pointer font-medium"
                >
                  <option value="activities">Activities (Workshop)</option>
                  <option value="events">Events (Visits &amp; Training)</option>
                  <option value="team">Team (Staff &amp; Outgrowers)</option>
                </select>
              </div>

              {/* Caption / Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C1E12]">
                  Caption &amp; Archival Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full border border-[#00A859]/30 bg-white p-2.5 text-xs text-[#0C1E12] placeholder-[#5A6259]/50 focus:border-[#00A859] focus:outline-none rounded-xs text-justify"
                  placeholder="Detailed description providing field or event context..."
                />
              </div>

              {/* Image Selection Area */}
              {mediaType === 'folder' ? (
                <div className="space-y-3 border border-dashed border-[#00A859]/30 bg-[#FAF9F6] p-4 rounded-xs">
                  <div className="flex items-center justify-between border-b border-[#00A859]/15 pb-2.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00A859]">
                      Select Images *
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImageSelectionMode('files');
                          resetImages();
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border cursor-pointer ${
                          imageSelectionMode === 'files'
                            ? 'border-[#0C1E12] bg-[#0C1E12] text-white'
                            : 'border-[#00A859]/20 bg-white text-[#5A6259]'
                        }`}
                      >
                        <FileImage size={11} /> Individual Files
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setImageSelectionMode('directory');
                          resetImages();
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border cursor-pointer ${
                          imageSelectionMode === 'directory'
                            ? 'border-[#0C1E12] bg-[#0C1E12] text-white'
                            : 'border-[#00A859]/20 bg-white text-[#5A6259]'
                        }`}
                      >
                        <FolderUp size={11} /> Entire Folder
                      </button>
                    </div>
                  </div>

                  {imageSelectionMode === 'files' ? (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] text-[#5A6259]">
                        Hold <kbd className="px-1 border bg-white text-[10px] font-mono">Ctrl</kbd> or <kbd className="px-1 border bg-white text-[10px] font-mono">Cmd</kbd> to choose multiple image files.
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        required
                        onChange={handleImageSelect}
                        className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#00A859]/30 file:text-xs file:font-mono file:font-bold file:uppercase file:bg-white file:text-[#0C1E12] hover:file:bg-[#00A859] hover:file:text-white cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] text-[#5A6259]">
                        Select a directory from your system. Non-image files will be automatically filtered out.
                      </p>
                      <input
                        type="file"
                        // @ts-expect-error - webkitdirectory is a Chromium browser API
                        webkitdirectory=""
                        directory=""
                        multiple
                        required
                        onChange={handleImageSelect}
                        className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#00A859]/30 file:text-xs file:font-mono file:font-bold file:uppercase file:bg-white file:text-[#0C1E12] hover:file:bg-[#00A859] hover:file:text-white cursor-pointer"
                      />
                    </div>
                  )}

                  {images.length > 0 && (
                    <p className="text-[10px] font-mono font-bold text-[#00A859] pt-1">
                      ✓ Selected {images.length} image file{images.length > 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Cover image + optional per-image caption picker */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-[#00A859]/15">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5B800]">
                          <Star size={12} fill="currentColor" /> Choose Cover &amp; Captions
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold ${
                            coverIndex === null ? 'text-red-600' : 'text-[#00A859]'
                          }`}
                        >
                          {coverIndex === null ? 'No cover selected' : `Cover: #${coverIndex + 1}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A6259]">
                        Click an image to set it as the cover (required). Adding a caption to a photo
                        is optional — it&apos;s only used to label that photo and to name its file when
                        someone downloads it from the site later.
                      </p>
                      {renderCoverPicker('max-h-72', false)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 border border-dashed border-[#00A859]/30 bg-[#FAF9F6] p-4 rounded-xs">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00A859]">
                      <Film size={13} /> Upload MP4/MOV Video File *
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      required
                      onChange={handleVideoSelect}
                      className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#00A859]/30 file:text-xs file:font-mono file:font-bold file:uppercase file:bg-white file:text-[#0C1E12] hover:file:bg-[#00A859] hover:file:text-white cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#00A859]/15">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5B800]">
                      <ImageIcon size={13} /> Upload Video Cover Thumbnail *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleThumbnailSelect}
                      className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#00A859]/30 file:text-xs file:font-mono file:font-bold file:uppercase file:bg-white file:text-[#0C1E12] hover:file:bg-[#00A859] hover:file:text-white cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </form>
          )}

          {/* ── STEP 2: EXACT PREVIEW DISPLAY ───────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              
              <div className="border border-[#00A859]/30 bg-[#FAF9F6] p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#00A859]/15 pb-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#E5B800]">
                    HOW IT WILL APPEAR IN GALLERY
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#00A859] text-white px-2 py-0.5">
                    <Tag size={10} /> {category}
                  </span>
                </div>

                {/* Cover image preview */}
                {mediaType === 'folder' && coverIndex !== null && imagePreviews[coverIndex] && (
                  <div className="relative aspect-video border border-[#E5B800]/60 bg-[#0C1E12] overflow-hidden">
                    <Image
                      src={imagePreviews[coverIndex]}
                      alt="Collection cover preview"
                      width={1200}
                      height={675}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#E5B800] text-[#0C1E12] text-[9px] font-mono font-bold uppercase px-2 py-0.5">
                      <Star size={10} fill="currentColor" /> Cover
                    </span>
                  </div>
                )}

                <h2 className="text-base sm:text-lg font-semibold text-[#0C1E12]">
                  {title}
                </h2>

                <p className="text-xs text-[#3A4239] leading-relaxed text-justify font-normal">
                  {caption}
                </p>
              </div>

              {/* Image Collection Grid Preview */}
              {mediaType === 'folder' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0C1E12]">
                      Attached Images ({images.length} File{images.length > 1 ? 's' : ''})
                    </span>
                    <span className="text-[9px] font-mono text-[#5A6259]">
                      Click to change cover · edit captions · test download
                    </span>
                  </div>

                  {renderCoverPicker('max-h-80', true)}
                </div>
              )}

              {/* Video & Thumbnail Stream Preview */}
              {mediaType === 'video' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Video Player Stream */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00A859] block">
                      Video Stream Player
                    </span>
                    {videoPreviewUrl ? (
                      <div className="aspect-video bg-black border border-[#00A859]/30 overflow-hidden flex items-center justify-center">
                        <video src={videoPreviewUrl} controls className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-[#FAF9F6] border border-dashed border-[#00A859]/30 flex items-center justify-center text-xs text-[#5A6259]">
                        No video attached
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Image Display */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5B800] block">
                      Cover Thumbnail Display
                    </span>
                    {thumbnailPreviewUrl ? (
                      <div className="aspect-video bg-[#0C1E12] border border-[#00A859]/30 overflow-hidden relative">
                        <Image src={thumbnailPreviewUrl} alt="Thumbnail preview" width={1200} height={900} unoptimized className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-[#FAF9F6] border border-dashed border-[#00A859]/30 flex items-center justify-center text-xs text-[#5A6259]">
                        No thumbnail attached
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-[#00A859]/20 px-6 py-4 bg-[#FAF9F6] shrink-0">
          
          {step === 1 ? (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="border border-[#00A859]/30 bg-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0C1E12] hover:border-[#00A859] hover:bg-white transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="gallery-upload-form"
                className="inline-flex items-center gap-1.5 border border-[#00A859] bg-[#00A859] px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-[#008A47] transition-colors cursor-pointer"
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 border border-[#00A859]/30 bg-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0C1E12] hover:border-[#00A859] hover:bg-white transition cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 border border-[#E5B800] bg-[#E5B800] px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0C1E12] hover:bg-[#c9a000] transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>{isSubmitting ? (submitStatus || 'Submitting...') : 'Submit'}</span>
              </button>
            </>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}