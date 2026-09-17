// app/components/GalleryUploadModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { galleryApi } from '@/lib/api/gallery';
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
} from 'lucide-react';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GalleryUploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [mediaType, setMediaType] = useState<'folder' | 'video'>('folder');
  const [imageSelectionMode, setImageSelectionMode] = useState<'files' | 'directory'>('files');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'activities' | 'events' | 'team'>('activities');
  const [caption, setCaption] = useState('');

  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  // Handles both multiple individual files and entire directory selections
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    
    // Filter strictly for image mime types
    const validImages = selectedFiles.filter((file) => file.type.startsWith('image/'));
    
    if (validImages.length === 0) {
      setModalError('No valid image files found in your selection.');
      setImages([]);
      return;
    }

    setModalError(null);
    setImages(validImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('mediaType', mediaType);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('caption', caption);

      if (mediaType === 'folder') {
        if (!images || images.length === 0) {
          throw new Error('Please select at least one image file or folder.');
        }
        images.forEach((img) => formData.append('images', img));
      } else if (mediaType === 'video') {
        if (!video) throw new Error('Please attach an MP4/MOV video file.');
        if (!thumbnail) throw new Error('Please attach a video cover thumbnail image.');
        formData.append('video', video);
        formData.append('thumbnail', thumbnail);
      }

      await galleryApi.createItem(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit gallery upload modal:', err);
      setModalError(err?.message || 'Failed to upload media files.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: 'var(--font-body)' };
  const displayFont: React.CSSProperties = { fontFamily: 'var(--font-display)' };
  const monoFont: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

  return createPortal(
    <div
      className={`${fontVars} fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E2620]/50 p-4 backdrop-blur-md animate-in fade-in duration-150`}
      style={bodyFont}
    >
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden border border-[#D9D4C6] bg-[#FDFCFA] text-[#1E2620] shadow-2xl rounded-sm">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D9D4C6] bg-[#F3F2ED] px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="border border-[#D9D4C6] bg-white p-1.5 text-[#3F6B4F]">
              <UploadCloud size={16} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#8B9188]" style={monoFont}>
                BioCap Archive Publisher
              </p>
              <h3 className="text-[15px] italic leading-tight text-[#1E2620]" style={displayFont}>
                Upload New Image Collection or HD Video
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border border-transparent p-1.5 text-[#8B9188] transition-colors hover:border-[#D9D4C6] hover:text-[#1E2620] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Error Banner */}
        {modalError && (
          <div className="flex items-center gap-3 border-b border-[#B65C4B] bg-[#FBEEEC] px-6 py-3 shrink-0">
            <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
            <p className="text-xs font-semibold text-[#7A362A]">{modalError}</p>
          </div>
        )}

        {/* Scrollable Form Area */}
        <form id="gallery-upload-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Content Type Switcher */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
              Select Content Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaType('folder');
                  setVideo(null);
                  setThumbnail(null);
                }}
                className={`flex items-center gap-3 p-3 border text-left transition-all cursor-pointer ${
                  mediaType === 'folder'
                    ? 'border-[#3F6B4F] bg-[#3F6B4F]/10 text-[#1E2620] font-semibold'
                    : 'border-[#D9D4C6] bg-white text-[#5A6259] hover:bg-[#FAF9F5]'
                }`}
              >
                <FolderPlus size={18} className={mediaType === 'folder' ? 'text-[#3F6B4F]' : 'text-[#8B9188]'} />
                <div>
                  <p className="text-xs font-bold">Image Collection</p>
                  <p className="text-[10px] text-[#8B9188]">Upload image files or an entire folder</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  setImages([]);
                }}
                className={`flex items-center gap-3 p-3 border text-left transition-all cursor-pointer ${
                  mediaType === 'video'
                    ? 'border-[#C22055] bg-[#C22055]/10 text-[#1E2620] font-semibold'
                    : 'border-[#D9D4C6] bg-white text-[#5A6259] hover:bg-[#FAF9F5]'
                }`}
              >
                <Video size={18} className={mediaType === 'video' ? 'text-[#C22055]' : 'text-[#8B9188]'} />
                <div>
                  <p className="text-xs font-bold">HD Video Entry</p>
                  <p className="text-[10px] text-[#8B9188]">Attach MP4/MOV video with thumbnail</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
              Archive Entry Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-[#D9D4C6] bg-white p-2.5 text-xs text-[#1E2620] placeholder-[#8B9188] focus:border-[#1E2620] focus:outline-none rounded-xs"
              placeholder="e.g. RAB Rubona Cassava Field Trials"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
              Target Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'activities' | 'events' | 'team')}
              className="w-full border border-[#D9D4C6] bg-white p-2.5 text-xs text-[#1E2620] focus:border-[#1E2620] focus:outline-none rounded-xs cursor-pointer"
            >
              <option value="activities">Activities</option>
              <option value="events">Events</option>
              <option value="team">Team</option>
            </select>
          </div>

          {/* Caption / Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6259]" style={monoFont}>
              Caption &amp; Archival Description *
            </label>
            <textarea
              required
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-[#D9D4C6] bg-white p-2.5 text-xs text-[#1E2620] placeholder-[#8B9188] focus:border-[#1E2620] focus:outline-none rounded-xs"
              placeholder="Detailed description providing research or event context..."
            />
          </div>

          {/* Flexible Image Upload (Individual Files OR Whole Directory) */}
          {mediaType === 'folder' ? (
            <div className="space-y-3 border border-dashed border-[#D9D4C6] bg-[#FAF9F5] p-5 rounded-xs">
              {/* Selection Mode Toggle */}
              <div className="flex items-center justify-between border-b border-[#E2DDCF] pb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3F6B4F]" style={monoFont}>
                  Select Images *
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageSelectionMode('files');
                      setImages([]);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                      imageSelectionMode === 'files'
                        ? 'border-[#1E2620] bg-[#1E2620] text-white'
                        : 'border-[#D9D4C6] bg-white text-[#5A6259]'
                    }`}
                    style={monoFont}
                  >
                    <FileImage size={11} /> Individual Files
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImageSelectionMode('directory');
                      setImages([]);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                      imageSelectionMode === 'directory'
                        ? 'border-[#1E2620] bg-[#1E2620] text-white'
                        : 'border-[#D9D4C6] bg-white text-[#5A6259]'
                    }`}
                    style={monoFont}
                  >
                    <FolderUp size={11} /> Entire Folder
                  </button>
                </div>
              </div>

              {/* Conditional File Input based on mode */}
              {imageSelectionMode === 'files' ? (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-[#8B9188]">
                    Hold <kbd className="px-1 border bg-white text-[10px]">Ctrl</kbd> or <kbd className="px-1 border bg-white text-[10px]">Cmd</kbd> to pick multiple image files.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    required
                    onChange={handleImageSelect}
                    className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#D9D4C6] file:text-xs file:font-semibold file:bg-white file:text-[#1E2620] hover:file:bg-[#EFECE6] cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-[#8B9188]">
                    Select a directory from your system. Non-image files will be automatically filtered out.
                  </p>
                  <input
                    type="file"
                    //@ts-ignore - webkitdirectory browser API standard
                    webkitdirectory=""
                    directory=""
                    multiple
                    required
                    onChange={handleImageSelect}
                    className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#D9D4C6] file:text-xs file:font-semibold file:bg-white file:text-[#1E2620] hover:file:bg-[#EFECE6] cursor-pointer"
                  />
                </div>
              )}

              {images.length > 0 && (
                <p className="text-[11px] font-semibold text-[#3F6B4F] pt-2" style={monoFont}>
                  ✓ Selected {images.length} image file{images.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 border border-dashed border-[#D9D4C6] bg-[#FAF9F5] p-4 rounded-xs">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C22055]" style={monoFont}>
                  <Film size={14} /> Upload MP4/MOV Video File *
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  required
                  onChange={(e) => setVideo(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#D9D4C6] file:text-xs file:font-semibold file:bg-white file:text-[#1E2620] hover:file:bg-[#EFECE6] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#EDEAE0]">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A9812F]" style={monoFont}>
                  <ImageIcon size={14} /> Upload Video Cover Thumbnail *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#5A6259] file:mr-4 file:py-1.5 file:px-3 file:border file:border-[#D9D4C6] file:text-xs file:font-semibold file:bg-white file:text-[#1E2620] hover:file:bg-[#EFECE6] cursor-pointer"
                />
              </div>
            </div>
          )}
        </form>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-[#D9D4C6] px-6 py-4 bg-[#FAF9F5] shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="border border-[#D9D4C6] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3A4239] hover:border-[#1E2620] hover:text-[#1E2620] transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="gallery-upload-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {isSubmitting ? 'Publishing...' : 'Publish Media'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}