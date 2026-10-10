'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Images,
  Loader2,
  Pause,
  Play,
  Share2,
} from 'lucide-react';
import { galleryApi } from '@/lib/api/gallery';
import type { GalleryItem } from '@/types';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const getMediaRecords = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const key of ['items', 'media', 'data', 'results']) {
    const candidate = record?.[key];
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

async function getWebsiteGalleryItem(slug: string): Promise<GalleryItem> {
  const [collectionResponse, mediaResponse] = await Promise.all([
    galleryApi.getWebsiteCollection(slug),
    galleryApi.getWebsiteCollectionMedia(slug),
  ]);
  const collectionPayload = asRecord(collectionResponse);
  const collection = asRecord(collectionPayload?.collection) ||
    asRecord(collectionPayload?.item) ||
    asRecord(collectionPayload?.data) || collectionPayload;
  if (!collection) throw new Error('Collection was not found.');

  const images = getMediaRecords(mediaResponse).flatMap((record, index) => {
    const media = asRecord(record);
    if (!media) return [];
    const variants = asRecord(media.variants);
    const urls = asRecord(media.urls);
    const nestedMedia = asRecord(media.media);
    const candidate = media.url || media.originalUrl || media.downloadUrl || media.fileUrl ||
      media.mediaUrl || media.thumbnailUrl || variants?.original || urls?.preview ||
      urls?.download || urls?.thumbnail || urls?.original || nestedMedia?.url;
    const url = typeof candidate === 'string' ? candidate : asRecord(candidate)?.url;
    if (typeof url !== 'string' || !url) return [];
    const mediaId = String(media.id || media._id || media.mediaId || index);
    return [{
      _id: mediaId,
      publicId: mediaId,
      referenceId: mediaId,
      url,
      caption: typeof media.title === 'string' ? media.title :
        typeof media.caption === 'string' ? media.caption : null,
    }];
  });

  return {
    _id: String(collection.id || slug),
    mediaType: 'folder',
    title: String(collection.name || collection.title || slug),
    category: 'activities',
    caption: String(collection.description || collection.caption || ''),
    images,
    createdBy: { _id: '', username: '', role: 'admin' },
    createdAt: String(collection.createdAt || new Date().toISOString()),
    updatedAt: String(collection.updatedAt || new Date().toISOString()),
  };
}

export default function GalleryCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [galleryId, setGalleryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox Modal State
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  // Interactive UI state (likes are keyed by image url and remembered in this browser)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);

  const likesLoadedRef = useRef(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let websiteRequestInFlight = false;
    let refreshInterval: number | undefined;
    let websiteSlug: string | null = null;

    const refreshWebsiteCollection = async () => {
      if (!websiteSlug || websiteRequestInFlight) return;
      websiteRequestInFlight = true;
      try {
        const refreshedItem = await getWebsiteGalleryItem(websiteSlug);
        if (isCurrent) setItem(refreshedItem);
      } catch (refreshError) {
        console.error('Failed to refresh website gallery photos:', refreshError);
      } finally {
        websiteRequestInFlight = false;
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshWebsiteCollection();
    };

    const loadItem = async () => {
      try {
        const { id } = await params;
        if (isCurrent) setGalleryId(id);
        if (/^[a-f\d]{24}$/i.test(id)) {
          const response = await galleryApi.getItemById(id);
          if (isCurrent) setItem(response.data);
          return;
        }
        websiteSlug = id;
        const websiteItem = await getWebsiteGalleryItem(id);
        if (isCurrent) setItem(websiteItem);
        if (isCurrent) {
          refreshInterval = window.setInterval(refreshWebsiteCollection, 5_000);
          document.addEventListener('visibilitychange', refreshWhenVisible);
        }
      } catch {
        if (isCurrent) setError('This gallery could not be found or is no longer published.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void loadItem();
    return () => {
      isCurrent = false;
      if (refreshInterval !== undefined) window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [params]);

  const images = item?.images || [];
  const lightboxOpen = activeImageIndex !== null;

  // Remember liked photos per gallery (safe if storage is blocked)
  useEffect(() => {
    if (!galleryId) return;
    try {
      const saved = window.localStorage.getItem(`gallery-likes:${galleryId}`);
      if (saved) setLikedMap(JSON.parse(saved));
    } catch {
      /* storage unavailable */
    }
    likesLoadedRef.current = true;
  }, [galleryId]);

  useEffect(() => {
    if (!galleryId || !likesLoadedRef.current) return;
    try {
      window.localStorage.setItem(`gallery-likes:${galleryId}`, JSON.stringify(likedMap));
    } catch {
      /* storage unavailable */
    }
  }, [likedMap, galleryId]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const closeLightbox = () => {
    setActiveImageIndex(null);
    setIsPlayingSlideshow(false);
  };

  const goPrev = () => setActiveImageIndex((p) => (p !== null && p > 0 ? p - 1 : p));
  const goNext = () => setActiveImageIndex((p) => (p !== null && p < images.length - 1 ? p + 1 : p));

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

  // Lightbox: lock page scroll, Esc to close, ← → to navigate
  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveImageIndex(null);
        setIsPlayingSlideshow(false);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((p) => (p !== null && p < images.length - 1 ? p + 1 : p));
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((p) => (p !== null && p > 0 ? p - 1 : p));
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, images.length]);

  // Preload the neighbouring photos so next / previous feel instant
  useEffect(() => {
    if (activeImageIndex === null || !item?.images) return;
    [activeImageIndex - 1, activeImageIndex + 1].forEach((i) => {
      const url = item.images?.[i]?.url;
      if (url) {
        const preload = new window.Image();
        preload.src = url;
      }
    });
  }, [activeImageIndex, item]);

  // Keep the active thumbnail in view in the filmstrip
  useEffect(() => {
    if (activeImageIndex === null) return;
    document
      .getElementById(`filmstrip-${activeImageIndex}`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeImageIndex]);

  // Keep downloaded names descriptive while removing characters Windows forbids in filenames.
  const getFileName = (index: number, caption?: string | null, url?: string) => {
    const sanitize = (text: string) =>
      text
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
        .replace(/\s+/g, ' ')
        .replace(/[. ]+$/g, '');

    const sourceName = url ? decodeURIComponent(url.split('?')[0].split('/').pop() || '') : '';
    const urlExt = sourceName.split('.').pop()?.toLowerCase();
    const ext = urlExt && IMAGE_EXTENSIONS.includes(urlExt) ? urlExt : 'jpg';
    const sourceTitle = sourceName.replace(/\.[^.]+$/, '');
    const imageName = sanitize(caption || '') || sanitize(sourceTitle) || `Image ${String(index + 1).padStart(2, '0')}`;
    const collectionName = sanitize(item?.title || 'Collection') || 'Collection';
    return `BioCap Gallery - ${collectionName} - ${imageName}.${ext}`;
  };

  // Direct File Download Logic
  const handleDownload = async (e: React.MouseEvent, imageUrl: string, fileName: string) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Download failed');
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

  const flashCopied = () => {
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  // Web Share API with Clipboard Fallback
  const handleShare = async (e: React.MouseEvent, imageUrl: string, title?: string | null) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title || 'Gallery Image',
          url: imageUrl,
        });
      } catch {
        // Ignored if user dismissed share sheet
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(imageUrl);
      flashCopied();
    } catch {
      // Clipboard blocked (e.g. insecure page): let the person copy it by hand
      window.prompt('Copy this link:', imageUrl);
    }
  };

  const toggleLike = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [url]: !prev[url] }));
  };

  const scrollToGallery = () => {
    document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Swipe left / right on touch screens
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goNext();
    else goPrev();
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-20 text-center">
        <p className="text-lg font-semibold text-gray-800">{error || 'Gallery not found.'}</p>
        <Link
          href="/Gallery"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Back to collections
        </Link>
      </div>
    );
  }

  // Pick cover explicitly based on isCover flag
  const selectedCover = item.images?.find((image) => image.isCover)?.url;
  const coverImage = selectedCover || item.thumbnailUrl || images[0]?.url || '';

  const activeImage = activeImageIndex !== null ? images[activeImageIndex] : null;
  const activeLoaded = !!activeImage && loadedUrl === activeImage.url;

  // Shared look for the lightbox action icons: always visible, big tap target
  const iconBtn =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-400 disabled:opacity-50';

  // Small round buttons that sit on top of the grid photos
  const tileBtn =
    'flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Cover Hero Header */}
      <section className="relative isolate flex min-h-[58vh] w-full items-end justify-start overflow-hidden bg-gray-900 text-white">
        {coverImage && (
          <Image
            src={coverImage}
            alt={item.title}
            fill
            priority
            unoptimized
            className="object-cover opacity-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

        {item.category && (
          <p className="absolute left-4 top-4 z-10 inline-block rounded-full border border-white/40 bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm sm:left-8 sm:top-8">
            {item.category}
          </p>
        )}

        <div className="relative z-10 w-full px-5 pb-8 pt-20 text-left sm:px-8 sm:pb-10 lg:px-12">
          <h1 className="line-clamp-2 w-full text-left text-[18px] font-bold leading-6 text-white drop-shadow-md">
            {item.title}
          </h1>
          {item.caption && (
            <p className="mt-2 line-clamp-3 w-full text-left text-sm leading-relaxed text-white/90 sm:text-base">
              {item.caption}
            </p>
          )}
          <div className="mt-5 flex justify-center">
            <button
              onClick={scrollToGallery}
              className="group inline-flex items-center gap-2 rounded-full border border-white/80 bg-black/15 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-white hover:text-black"
            >
              View Gallery
              <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Gallery Grid Section */}
      <div id="gallery-section" className="mx-auto max-w-[1400px] scroll-mt-4 px-4 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <Link href="/Gallery" className="inline-flex items-center gap-2 transition hover:text-black">
            <ArrowLeft size={16} /> Back to collections
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
            <Images size={14} />
            {item.mediaType === 'folder' ? `${images.length} photos` : 'Video'}
          </span>
        </div>

        {item.mediaType === 'video' ? (
          <video
            className="mx-auto max-h-[75vh] w-full max-w-5xl rounded-lg bg-black shadow-lg"
            src={item.videoUrl}
            poster={item.thumbnailUrl}
            controls
            playsInline
          />
        ) : images.length ? (
          <section
            aria-label={`${item.title} photos`}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {images.map((image, index) => {
              const fileName = getFileName(index, image.caption, image.url);
              const liked = !!likedMap[image.url];

              return (
                <div
                  key={image._id || image.referenceId || image.publicId || index}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open photo ${index + 1}${image.caption ? `: ${image.caption}` : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveImageIndex(index);
                    }
                  }}
                  className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-md bg-gray-100 ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  <Image
                    src={image.url}
                    alt={image.caption || `${item.title}, photo ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading={index < 8 ? 'eager' : 'lazy'}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Always visible on touch screens, shown on hover / focus on desktop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100" />

                  {/* Liked badge stays visible even when the bar is hidden */}
                  {liked && (
                    <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow md:group-hover:opacity-0">
                      <Heart size={14} className="fill-current" />
                    </span>
                  )}

                  {/* Action pill */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 rounded-full bg-black/50 p-1 opacity-100 backdrop-blur-md transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <button
                      onClick={(e) => toggleLike(e, image.url)}
                      aria-label={liked ? 'Unlike photo' : 'Like photo'}
                      aria-pressed={liked}
                      title={liked ? 'Liked' : 'Like'}
                      className={`${tileBtn} ${liked ? 'bg-red-600 hover:bg-red-600' : ''}`}
                    >
                      <Heart size={15} className={liked ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, image.url, fileName)}
                      aria-label="Download photo"
                      title="Download"
                      className={tileBtn}
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={(e) => handleShare(e, image.url, image.caption || item.title)}
                      aria-label="Share photo"
                      title="Share"
                      className={tileBtn}
                    >
                      <Share2 size={15} />
                    </button>
                  </div>

                  {/* Overlay Caption on Grid Image */}
                  {image.caption && (
                    <p className="absolute bottom-3.5 left-4 right-32 z-10 line-clamp-2 text-xs font-medium leading-snug text-white opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      {image.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        ) : (
          <div className="py-24 text-center text-gray-500">
            <Images className="mx-auto mb-3" size={36} />
            No photos are available in this collection.
          </div>
        )}
      </div>

      {/* Full-Screen Single Image Lightbox.
          Rendered in a portal on <body> so the site navbar / other stacked layers can
          never cover the top bar or hide the icons. */}
      {activeImage &&
        activeImageIndex !== null &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} photo ${activeImageIndex + 1} of ${images.length}`}
            className="fixed inset-0 z-[100000] flex flex-col bg-white text-gray-800"
          >
            {/* Top bar: back on the left, like / download / share / play on the right */}
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-3 sm:px-6">
              <button onClick={closeLightbox} className={iconBtn} aria-label="Back to gallery" title="Back">
                <ArrowLeft size={24} strokeWidth={1.75} />
              </button>

              <p className="hidden min-w-0 flex-1 truncate text-center text-sm font-medium text-gray-500 md:block">
                {item.title}
              </p>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={(e) => toggleLike(e, activeImage.url)}
                  title={likedMap[activeImage.url] ? 'Liked' : 'Like'}
                  aria-label="Like photo"
                  aria-pressed={!!likedMap[activeImage.url]}
                  className={iconBtn}
                >
                  <Heart
                    size={24}
                    strokeWidth={1.75}
                    className={likedMap[activeImage.url] ? 'fill-red-500 text-red-500' : ''}
                  />
                </button>

                <button
                  onClick={(e) =>
                    handleDownload(
                      e,
                      activeImage.url,
                      getFileName(activeImageIndex, activeImage.caption, activeImage.url)
                    )
                  }
                  disabled={downloading}
                  title="Download"
                  aria-label="Download photo"
                  className={iconBtn}
                >
                  {downloading ? (
                    <Loader2 size={24} className="animate-spin text-black" />
                  ) : (
                    <Download size={24} strokeWidth={1.75} />
                  )}
                </button>

                <button
                  onClick={(e) => handleShare(e, activeImage.url, activeImage.caption || item.title)}
                  title="Share"
                  aria-label="Share photo"
                  className={`${iconBtn} relative`}
                >
                  {copied ? (
                    <Check size={24} className="text-green-600" />
                  ) : (
                    <Share2 size={24} strokeWidth={1.75} />
                  )}
                  {copied && (
                    <span className="absolute -bottom-7 right-0 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                      Link copied
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsPlayingSlideshow((v) => !v)}
                  title={isPlayingSlideshow ? 'Pause slideshow' : 'Play slideshow'}
                  aria-label={isPlayingSlideshow ? 'Pause slideshow' : 'Play slideshow'}
                  aria-pressed={isPlayingSlideshow}
                  className={`${iconBtn} ${isPlayingSlideshow ? 'bg-green-50 text-green-600 hover:text-green-700' : ''}`}
                >
                  {isPlayingSlideshow ? (
                    <Pause size={24} strokeWidth={1.75} className="fill-current" />
                  ) : (
                    <Play size={24} strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </header>

            {/* Image area: fills the space between the top bar and the filename.
                Swipe left / right on touch screens. */}
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-2 sm:px-20"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {activeImageIndex > 0 && (
                <button
                  onClick={goPrev}
                  className={`${iconBtn} absolute left-1 top-1/2 z-10 -translate-y-1/2 sm:left-4`}
                  aria-label="Previous photo"
                  title="Previous"
                >
                  <ChevronLeft size={36} strokeWidth={1.5} />
                </button>
              )}

              <div className="relative w-full max-w-5xl self-stretch">
                {!activeLoaded && (
                  <div className="absolute inset-0 z-0 flex items-center justify-center text-gray-300">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                )}
                <Image
                  key={activeImage.url}
                  src={activeImage.url}
                  alt={activeImage.caption || item.title}
                  fill
                  unoptimized
                  priority
                  onLoad={() => setLoadedUrl(activeImage.url)}
                  className={`object-contain transition-opacity duration-300 ${
                    activeLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>

              {activeImageIndex < images.length - 1 && (
                <button
                  onClick={goNext}
                  className={`${iconBtn} absolute right-1 top-1/2 z-10 -translate-y-1/2 sm:right-4`}
                  aria-label="Next photo"
                  title="Next"
                >
                  <ChevronRight size={36} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Caption, filename and position under the photo */}
            <footer className="shrink-0 px-4 pb-2 pt-3 text-center">
              {activeImage.caption && (
                <p className="mx-auto mb-1 max-w-2xl text-sm leading-snug text-gray-700">
                  {activeImage.caption}
                </p>
              )}
              <p className="truncate text-sm text-gray-500">
                {getFileName(activeImageIndex, activeImage.caption, activeImage.url)}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {activeImageIndex + 1} / {images.length}
              </p>
            </footer>

            {/* Filmstrip of thumbnails (desktop / tablet) */}
            {images.length > 1 && (
              <div className="hidden shrink-0 border-t border-gray-100 bg-white px-4 py-2.5 md:block">
                <div className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image._id || image.referenceId || image.publicId || index}
                      id={`filmstrip-${index}`}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Go to photo ${index + 1}`}
                      aria-current={index === activeImageIndex}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded transition ${
                        index === activeImageIndex
                          ? 'ring-2 ring-gray-900 ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        unoptimized
                        loading="lazy"
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </main>
  );
}