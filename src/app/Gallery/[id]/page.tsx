'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Images,
  Loader2,
  Play,
  Share2,
} from 'lucide-react';
import { galleryApi } from '@/lib/api/gallery';
import type { GalleryItem } from '@/types';

export default function GalleryCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox Modal State
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Interactive UI state
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const loadItem = async () => {
      try {
        const { id } = await params;
        const response = await galleryApi.getItemById(id);
        if (isCurrent) setItem(response.data);
      } catch {
        if (isCurrent) setError('This gallery could not be found or is no longer published.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void loadItem();
    return () => {
      isCurrent = false;
    };
  }, [params]);

  const images = item?.images || [];

  // Slideshow auto-advance effect
  useEffect(() => {
    if (!isPlayingSlideshow || activeImageIndex === null) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => {
        if (prev === null) return null;
        return prev + 1 >= images.length ? 0 : prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlayingSlideshow, activeImageIndex, images.length]);

  // Dynamic Filename Builder: [Gallery Title]-[Caption OR 01, 02...]
  const getFileName = (index: number, caption?: string | null) => {
    const sanitize = (text: string) =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

    const galleryTitleSlug = item?.title ? sanitize(item.title) : 'gallery';

    if (caption && caption.trim()) {
      const captionSlug = sanitize(caption);
      return `${galleryTitleSlug}-${captionSlug}.jpg`;
    }

    const formattedId = String(index + 1).padStart(2, '0');
    return `${galleryTitleSlug}-${formattedId}.jpg`;
  };

  // Direct File Download Logic
  const handleDownload = async (e: React.MouseEvent, imageUrl: string, fileName: string) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // Web Share API with Clipboard Fallback
  const handleShare = async (e: React.MouseEvent, imageUrl: string, title?: string | null) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Gallery Image',
          url: imageUrl,
        });
      } catch (err) {
        // Ignored if user dismissed share sheet
      }
    } else {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleLike = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToGallery = () => {
    document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-white text-[#52645a]">
        <Loader2 className="animate-spin" size={24} /> Loading collection...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white py-20 text-center">
        <p className="text-lg font-semibold text-gray-800">{error || 'Gallery not found.'}</p>
        <Link href="/Gallery" className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:underline">
          <ArrowLeft size={16} /> Back to collections
        </Link>
      </div>
    );
  }

  // Pick cover explicitly based on isCover flag
  const selectedCover = item.images?.find((image) => image.isCover)?.url;
  const coverImage = selectedCover || item.thumbnailUrl || images[0]?.url || '';

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Cover Hero Header */}
      <section className="relative flex min-h-[75vh] w-full flex-col items-center justify-center bg-black/60 text-white">
        {coverImage && (
          <Image
            src={coverImage}
            alt={item.title}
            fill
            priority
            unoptimized
            className="object-cover opacity-40"
          />
        )}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gray-200">
            {item.category}
          </p>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide sm:text-5xl lg:text-6xl">
            {item.title}
          </h1>
          {item.caption && (
            <p className="mt-4 text-sm tracking-wide text-gray-300 sm:text-base">
              {item.caption}
            </p>
          )}
          <button
            onClick={scrollToGallery}
            className="mt-8 border border-white/80 bg-transparent px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
          >
            View Gallery
          </button>
        </div>
      </section>

      {/* Main Gallery Grid Section */}
      <div id="gallery-section" className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between border-b border-gray-200 pb-4 text-xs font-medium tracking-wider text-gray-600 uppercase">
          <Link href="/Gallery" className="inline-flex items-center gap-2 hover:text-black">
            <ArrowLeft size={16} /> Back to collections
          </Link>
          <div className="flex items-center gap-4">
            <span>{item.mediaType === 'folder' ? `${images.length} photos` : 'Video'}</span>
          </div>
        </div>

        {item.mediaType === 'video' ? (
          <video
            className="mx-auto max-h-[75vh] w-full max-w-5xl bg-black"
            src={item.videoUrl}
            poster={item.thumbnailUrl}
            controls
            playsInline
          />
        ) : images.length ? (
          <section
            aria-label={`${item.title} photos`}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {images.map((image, index) => {
              const fileName = getFileName(index, image.caption);

              return (
                <div
                  key={image._id || image.referenceId || image.publicId || index}
                  onClick={() => setActiveImageIndex(index)}
                  className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-gray-100"
                >
                  <Image
                    src={image.url}
                    alt={image.caption || `${item.title}, photo ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading={index < 8 ? 'eager' : 'lazy'}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                  {/* Hover Actions Bar */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      onClick={(e) => toggleLike(e, index)}
                      aria-label="Like photo"
                      className={`rounded-full p-2 backdrop-blur-sm transition ${
                        likedMap[index]
                          ? 'bg-red-600 text-white'
                          : 'bg-black/40 text-white hover:bg-black/70'
                      }`}
                    >
                      <Heart size={16} className={likedMap[index] ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, image.url, fileName)}
                      aria-label="Download photo"
                      className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => handleShare(e, image.url, image.caption || item.title)}
                      aria-label="Share photo"
                      className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  {/* Overlay Caption on Grid Image */}
                  {image.caption && (
                    <p className="absolute bottom-3 left-3 right-28 z-10 line-clamp-2 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {image.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        ) : (
          <div className="py-20 text-center text-gray-500">
            <Images className="mx-auto mb-3" size={32} />
            No photos are available in this collection.
          </div>
        )}
      </div>

      {/* Full-Screen Single Image Lightbox Modal */}
      {activeImageIndex !== null && images[activeImageIndex] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white text-gray-800">
          {/* Top Bar with Centered Filename Title & Far-Right Action Icons */}
          <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
            <button
              onClick={() => {
                setActiveImageIndex(null);
                setIsPlayingSlideshow(false);
              }}
              className="p-2 text-gray-600 transition hover:text-black"
              aria-label="Back to gallery"
            >
              <ArrowLeft size={22} />
            </button>

            {/* Centered Filename Title above Image */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <span className="text-sm font-normal text-[#5892c9] hover:underline cursor-pointer">
                {getFileName(activeImageIndex, images[activeImageIndex].caption)}
              </span>
            </div>

            {/* Far-Right Action Buttons */}
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => toggleLike(e, activeImageIndex)}
                title={likedMap[activeImageIndex] ? 'Liked' : 'Like'}
                className="p-1 text-gray-500 transition hover:text-black"
              >
                <Heart
                  size={20}
                  className={
                    likedMap[activeImageIndex]
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-500 hover:text-black'
                  }
                />
              </button>

              <button
                onClick={(e) =>
                  handleDownload(
                    e,
                    images[activeImageIndex].url,
                    getFileName(activeImageIndex, images[activeImageIndex].caption)
                  )
                }
                disabled={downloading}
                title="Download"
                className="p-1 text-gray-500 transition hover:text-black disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 size={20} className="animate-spin text-black" />
                ) : (
                  <Download size={20} />
                )}
              </button>

              <button
                onClick={(e) =>
                  handleShare(
                    e,
                    images[activeImageIndex].url,
                    images[activeImageIndex].caption || item.title
                  )
                }
                title="Share"
                className="relative p-1 text-gray-500 transition hover:text-black"
              >
                {copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} />}
                {copied && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap shadow">
                    Link Copied
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
                title={isPlayingSlideshow ? 'Pause' : 'Play Slideshow'}
                className={`p-1 transition ${
                  isPlayingSlideshow ? 'text-green-600' : 'text-gray-500 hover:text-black'
                }`}
              >
                <Play size={20} className={isPlayingSlideshow ? 'fill-current' : ''} />
              </button>
            </div>
          </header>

          {/* Center Image Container directly below top bar */}
          <div className="relative flex flex-1 items-center justify-center pt-20 pb-6 px-4">
            {activeImageIndex > 0 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev !== null ? prev - 1 : null))}
                className="absolute left-4 sm:left-8 z-30 text-gray-400 transition hover:text-black"
                aria-label="Previous photo"
              >
                <ChevronLeft size={36} strokeWidth={1.5} />
              </button>
            )}

            <div className="relative h-full w-full max-w-5xl">
              <Image
                src={images[activeImageIndex].url}
                alt={images[activeImageIndex].caption || item.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {activeImageIndex < images.length - 1 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev !== null ? prev + 1 : null))}
                className="absolute right-4 sm:right-8 z-30 text-gray-400 transition hover:text-black"
                aria-label="Next photo"
              >
                <ChevronRight size={36} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}