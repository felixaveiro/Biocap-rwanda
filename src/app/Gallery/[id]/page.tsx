'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
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
  X,
} from 'lucide-react';
import { galleryApi } from '@/lib/api/gallery';
import type { GalleryItem } from '@/types';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
const SLIDESHOW_MS = 3000;
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";

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

const getMediaUrl = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  const record = asRecord(value);
  return typeof record?.url === 'string' ? record.url : undefined;
};

async function getWebsiteGalleryItem(slug: string): Promise<GalleryItem> {
  const collectionResponse = await galleryApi.getWebsiteCollection(slug);
  const collectionPayload = asRecord(collectionResponse);
  const collection = asRecord(collectionPayload?.collection) ||
    asRecord(collectionPayload?.item) ||
    asRecord(collectionPayload?.data) || collectionPayload;
  if (!collection) throw new Error('Collection was not found.');

  return {
    _id: String(collection.id || slug),
    mediaType: 'folder',
    title: String(collection.name || collection.title || slug),
    category: 'workshop',
    caption: String(collection.description || collection.caption || ''),
    thumbnailUrl: [collection.coverUrl, collection.thumbnail, collection.thumbnailUrl].find(
      (url): url is string => typeof url === 'string' && !!url
    ),
    images: [],
    createdBy: { _id: '', username: '', role: 'admin' },
    createdAt: String(collection.createdAt || new Date().toISOString()),
    updatedAt: String(collection.updatedAt || new Date().toISOString()),
  };
}

async function getWebsiteGalleryImages(slug: string, coverUrl?: string): Promise<NonNullable<GalleryItem['images']>> {
  const mediaResponse = await galleryApi.getWebsiteCollectionMedia(slug);
  const coverMediaId = coverUrl?.match(/\/media\/([^/]+)\/thumbnail/)?.[1];
  const mediaRecords = getMediaRecords(mediaResponse)
    .map(asRecord)
    .filter((media): media is Record<string, unknown> => media !== null);
  const coverRecord = mediaRecords.find((media) =>
    String(media.id || media._id || '') === coverMediaId
  ) || mediaRecords[0];

  return mediaRecords.flatMap((media, index) => {
    const variants = asRecord(media.variants);
    const urls = asRecord(media.urls);
    const nestedMedia = asRecord(media.media);
    const isCover = media === coverRecord;
    const mediaSource = getMediaUrl(
      media.videoUrl || media.originalUrl || media.downloadUrl || media.fileUrl || media.mediaUrl ||
      media.url || variants?.original || urls?.original || urls?.download || nestedMedia?.url
    );
    const mediaTypeText = [media.mediaType, media.type, media.mimeType, media.contentType, media.fileType]
      .filter((value): value is string => typeof value === 'string')
      .join(' ')
      .toLowerCase();
    const mediaName = [media.fileName, media.filename, media.name]
      .filter((value): value is string => typeof value === 'string')
      .join(' ');
    const isVideo = mediaTypeText.includes('video') ||
      /\.(mp4|mov|webm|m4v)(?:[?#]|$)/i.test(mediaSource || '') ||
      /\.(mp4|mov|webm|m4v)$/i.test(mediaName);
    const thumbnailUrl = getMediaUrl(
      media.thumbnailUrl || media.thumbnail || media.previewUrl || urls?.thumbnail || urls?.preview ||
      variants?.thumbnail || variants?.preview || nestedMedia?.thumbnailUrl || nestedMedia?.thumbnail
    );
    const coverPreview = isCover
      ? [urls?.preview, urls?.download, urls?.thumbnail].find(
          (url): url is string => typeof url === 'string' && !!url
        )
      : undefined;
    const candidate = coverPreview || media.url || media.originalUrl || media.downloadUrl || media.fileUrl ||
      media.mediaUrl || media.thumbnailUrl || variants?.original || urls?.preview ||
      urls?.download || urls?.thumbnail || urls?.original || nestedMedia?.url;
    const url = isVideo ? thumbnailUrl || mediaSource : getMediaUrl(candidate);
    if (typeof url !== 'string' || !url) return [];
    const mediaId = String(media.id || media._id || media.mediaId || index);
    return [{
      _id: mediaId,
      publicId: mediaId,
      referenceId: mediaId,
      url,
      mediaType: isVideo ? 'video' as const : 'image' as const,
      videoUrl: isVideo ? mediaSource : undefined,
      thumbnailUrl: isVideo ? thumbnailUrl : undefined,
      isCover,
      caption: typeof media.title === 'string' ? media.title :
        typeof media.caption === 'string' ? media.caption : null,
    }];
  });
}

export default function GalleryCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [galleryId, setGalleryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state (index points into the photos currently shown in the grid)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  // Grid tile loading + interactive UI state
  const [loadedTiles, setLoadedTiles] = useState<Record<string, boolean>>({});
  const [failedVideoPosters, setFailedVideoPosters] = useState<Record<string, boolean>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);

  const likesLoadedRef = useRef(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadItem = async () => {
      try {
        const { id } = await params;
        if (isCurrent) setGalleryId(id);
        if (/^[a-f\d]{24}$/i.test(id)) {
          const response = await galleryApi.getItemById(id);
          if (isCurrent) setItem(response.data);
          return;
        }
        const websiteItem = await getWebsiteGalleryItem(id);
        if (!isCurrent) return;
        if (isCurrent) setItem(websiteItem);
        setLoading(false);
        setLoadingImages(true);
        void getWebsiteGalleryImages(id, websiteItem.thumbnailUrl)
          .then((websiteImages) => {
            if (isCurrent) {
              setItem((currentItem) => currentItem
                ? { ...currentItem, images: websiteImages }
                : currentItem);
            }
          })
          .catch((mediaError) => {
            console.error('Failed to load website gallery photos:', mediaError);
          })
          .finally(() => {
            if (isCurrent) setLoadingImages(false);
          });
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
  const sortedImages = [...images].sort(
    (left, right) => Number(right.mediaType === 'video') - Number(left.mediaType === 'video')
  );
  const likedCount = images.filter((image) => likedMap[image.url]).length;
  const visibleImages = onlyFavourites
    ? sortedImages.filter((image) => likedMap[image.url])
    : sortedImages;
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

  // If the visible list shrinks under the lightbox (un-liking while filtered), keep the index valid
  useEffect(() => {
    if (activeImageIndex === null) return;
    if (visibleImages.length === 0) {
      setActiveImageIndex(null);
      setIsPlayingSlideshow(false);
    } else if (activeImageIndex >= visibleImages.length) {
      setActiveImageIndex(visibleImages.length - 1);
    }
  }, [visibleImages.length, activeImageIndex]);

  const closeLightbox = () => {
    setActiveImageIndex(null);
    setIsPlayingSlideshow(false);
  };

  const goPrev = () => setActiveImageIndex((p) => (p !== null && p > 0 ? p - 1 : p));
  const goNext = () => setActiveImageIndex((p) => (p !== null && p < visibleImages.length - 1 ? p + 1 : p));

  const startSlideshow = () => {
    if (!visibleImages.length) return;
    setActiveImageIndex(0);
    setIsPlayingSlideshow(true);
  };

  // Slideshow auto-advance
  useEffect(() => {
    if (!isPlayingSlideshow || activeImageIndex === null) return;
    const timer = setTimeout(() => {
      setActiveImageIndex((prev) => {
        if (prev === null) return null;
        return prev + 1 >= visibleImages.length ? 0 : prev + 1;
      });
    }, SLIDESHOW_MS);
    return () => clearTimeout(timer);
  }, [isPlayingSlideshow, activeImageIndex, visibleImages.length]);

  // Lightbox: lock page scroll, Esc to close, arrows to navigate, space toggles slideshow
  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveImageIndex(null);
        setIsPlayingSlideshow(false);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((p) => (p !== null && p < visibleImages.length - 1 ? p + 1 : p));
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((p) => (p !== null && p > 0 ? p - 1 : p));
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, visibleImages.length]);

  // Preload the neighbouring photos so next / previous feel instant
  useEffect(() => {
    if (activeImageIndex === null) return;
    [activeImageIndex - 1, activeImageIndex + 1].forEach((i) => {
      const url = visibleImages[i]?.url;
      if (url) {
        const preload = new window.Image();
        preload.src = url;
      }
    });
  });

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

  // Direct file download
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

  // Web Share API with clipboard fallback
  const handleShare = async (e: React.MouseEvent, imageUrl: string, title?: string | null) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: title || 'Gallery Image', url: imageUrl });
      } catch {
        // Ignored if the person dismissed the share sheet
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(imageUrl);
      flashCopied();
    } catch {
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
      <div
        className="flex min-h-screen items-center justify-center gap-3 bg-white text-[#1B3A5C]"
        style={{ fontFamily: SANS }}
      >
        <Loader2 className="animate-spin" size={24} /> Loading collections...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-20 text-center"
        style={{ fontFamily: SANS }}
      >
        <p className="text-lg font-semibold text-[#1B3A5C]">{error || 'Gallery not found.'}</p>
        <Link
          href="/Gallery"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#1B3A5C]/25 px-5 py-2 text-sm font-semibold text-[#1B3A5C] transition hover:bg-[#1B3A5C] hover:text-white"
        >
          <ArrowLeft size={16} /> Back to collections
        </Link>
      </div>
    );
  }

  const selectedCover = item.images?.find((image) => image.isCover)?.url;
  const coverImage = selectedCover || images[0]?.url || item.thumbnailUrl || '';

  const createdDate = item.createdAt ? new Date(item.createdAt) : null;
  const dateLabel =
    createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })
      : '';

  const activeImage = activeImageIndex !== null ? visibleImages[activeImageIndex] : null;
  const activeLoaded = !!activeImage && loadedUrl === activeImage.url;

  // Lightbox icon buttons: large tap target, readable on the dark background
  const iconBtn =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 disabled:opacity-50';

  // Small round buttons on top of the grid photos
  const tileBtn =
    'flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

  return (
    <main className="min-h-screen bg-[#F7F4FB] text-[#1B3A5C]" style={{ fontFamily: SANS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes gl-progress { from { width: 0%; } to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) {
          .gl-progress-bar { animation: none !important; }
        }
      `}</style>
      <section className="relative isolate flex h-[80vh] min-h-[560px] w-full items-end overflow-hidden bg-[#1B3A5C] text-white">
        {/* Full-width background photo. -top-8 (2rem) pushes the image up so the top 2rem is cropped. */}
        {coverImage && (
          <div className="absolute inset-x-0 -top-8 bottom-0">
            <Image
              src={coverImage}
              alt={item.title}
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
        )}
        {/* Readability overlay: dark on the left (text side), light on the right so faces stay clear */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C]/85 via-[#1B3A5C]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C]/70 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-10 pt-28 sm:px-8 sm:pb-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[3px] text-white/70"
          >
            <Link href="/" className="transition hover:text-white">Home</Link>
            <span aria-hidden>&rsaquo;</span>
            <Link href="/Gallery" className="transition hover:text-white">Gallery</Link>
          </nav>

          <h1
            className="max-w-4xl text-[15px] leading-snug text-white drop-shadow-lg"
            style={{ fontFamily: SERIF, fontStyle: 'italic' }}
          >
            {item.title}
          </h1>

          {item.caption && (
            <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-white/85">
              {item.caption}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-white/85">
            {item.category && (
              <span className="rounded-full bg-[#E8185A] px-3 py-1.5 font-bold capitalize tracking-wide text-white">
                {item.category}
              </span>
            )}
            {item.mediaType === 'folder' && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Images size={13} />
                {loadingImages && images.length === 0 ? 'Loading photos...' : `${images.length} photos`}
              </span>
            )}
            {dateLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Calendar size={13} />
                {dateLabel}
              </span>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={scrollToGallery}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1B3A5C] transition hover:bg-[#E8185A] hover:text-white"
            >
              View photos
              <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            </button>
            {images.length > 0 && (
              <button
                onClick={startSlideshow}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/5 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                <Play size={14} className="fill-current" /> Slideshow
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Sticky toolbar ───────────────────────────────── */}
      {item.mediaType !== 'video' && (
        <div className="sticky top-0 z-30 border-b border-[#1B3A5C]/10 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <Link
              href="/Gallery"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B3A5C]/70 transition hover:text-[#E8185A]"
            >
              <ArrowLeft size={16} /> All collections
            </Link>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold text-[#1B3A5C]/60 sm:inline">
                {onlyFavourites
                  ? `${visibleImages.length} of ${images.length} photos`
                  : `${images.length} photos`}
              </span>
              <button
                onClick={() => setOnlyFavourites((v) => !v)}
                disabled={likedCount === 0 && !onlyFavourites}
                aria-pressed={onlyFavourites}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  onlyFavourites
                    ? 'border-[#E8185A] bg-[#E8185A] text-white'
                    : 'border-[#1B3A5C]/20 bg-white text-[#1B3A5C] hover:border-[#1B3A5C]'
                }`}
              >
                <Heart size={13} className={onlyFavourites ? 'fill-current' : ''} />
                Favourites{likedCount > 0 ? ` (${likedCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery ──────────────────────────────────────── */}
      <div id="gallery-section" className="mx-auto max-w-[1400px] scroll-mt-16 px-4 py-8 sm:px-8 sm:py-10">
        {item.mediaType === 'video' ? (
          <video
            className="mx-auto max-h-[75vh] w-full max-w-5xl rounded-xl bg-black shadow-2xl"
            src={item.videoUrl}
            poster={item.thumbnailUrl}
            controls
            playsInline
          />
        ) : visibleImages.length ? (
          <section
            aria-label={`${item.title} photos and videos`}
            className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4"
          >
            {visibleImages.map((image, index) => {
              const mediaUrl = image.videoUrl || image.url;
              const fileName = getFileName(index, image.caption, mediaUrl);
              const liked = !!likedMap[image.url];
              const imageKey = image._id || image.referenceId || image.publicId || String(index);
              const tileLoaded = !!loadedTiles[image.url];
              const videoPosterFailed = !!failedVideoPosters[image.url];

              return (
                <div
                  key={imageKey}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${image.mediaType === 'video' ? 'video' : 'photo'} ${index + 1}${image.caption ? `: ${image.caption}` : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveImageIndex(index);
                    }
                  }}
                  className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-lg bg-[#e6e9ef] shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3A5C] ${
                    tileLoaded ? '' : 'animate-pulse'
                  }`}
                >
                  {image.mediaType === 'video' ? (
                    image.thumbnailUrl && !videoPosterFailed ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.thumbnailUrl}
                        alt={image.caption || `${item.title}, video ${index + 1}`}
                        loading={index < 8 ? 'eager' : 'lazy'}
                        decoding="async"
                        onLoad={() => setLoadedTiles((prev) => (prev[image.url] ? prev : { ...prev, [image.url]: true }))}
                        onError={() => {
                          setFailedVideoPosters((prev) => ({ ...prev, [image.url]: true }));
                          setLoadedTiles((prev) => ({ ...prev, [image.url]: true }));
                        }}
                        className="block aspect-video w-full bg-[#17283b] object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1B3A5C] to-[#08111d] text-white/85">
                        <Play size={32} className="fill-current" />
                        <span className="text-xs font-semibold">Video preview unavailable</span>
                      </div>
                    )
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={image.caption || `${item.title}, photo ${index + 1}`}
                      loading={index < 8 ? 'eager' : 'lazy'}
                      decoding="async"
                      onLoad={() => setLoadedTiles((prev) => (prev[image.url] ? prev : { ...prev, [image.url]: true }))}
                      className={`block aspect-video w-full object-cover transition-opacity duration-500 ${
                        tileLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}

                  {image.mediaType === 'video' && (
                    <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg">
                      <Play size={20} className="ml-0.5 fill-current" />
                    </span>
                  )}

                  {/* Hover / focus gradient (always visible on touch screens) */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f2236]/65 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100" />

                  {liked && (
                    <span className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#E8185A] text-white shadow md:group-hover:opacity-0">
                      <Heart size={14} className="fill-current" />
                    </span>
                  )}

                  {image.caption && (
                    <p className="absolute bottom-3.5 left-4 right-32 z-10 line-clamp-2 text-xs font-medium leading-snug text-white opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      {image.caption}
                    </p>
                  )}

                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 rounded-full bg-black/50 p-1 opacity-100 backdrop-blur-md transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <button
                      onClick={(e) => toggleLike(e, image.url)}
                      aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
                      aria-pressed={liked}
                      title={liked ? 'Favourited' : 'Favourite'}
                      className={`${tileBtn} ${liked ? 'bg-[#E8185A] hover:bg-[#E8185A]' : ''}`}
                    >
                      <Heart size={15} className={liked ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, mediaUrl, fileName)}
                      aria-label="Download photo"
                      title="Download"
                      className={tileBtn}
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={(e) => handleShare(e, mediaUrl, image.caption || item.title)}
                      aria-label="Share photo"
                      title="Share"
                      className={tileBtn}
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        ) : onlyFavourites ? (
          <div className="py-24 text-center text-[#1B3A5C]/60">
            <Heart className="mx-auto mb-3" size={36} strokeWidth={1.4} />
            <p className="font-semibold text-[#1B3A5C]">No favourites yet</p>
            <button
              onClick={() => setOnlyFavourites(false)}
              className="mt-4 rounded-full border border-[#1B3A5C]/25 px-5 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-[#1B3A5C] hover:text-white"
            >
              Show all photos
            </button>
          </div>
        ) : loadingImages ? (
          <div className="flex items-center justify-center gap-3 py-24 text-[#1B3A5C]/60">
            <Loader2 className="animate-spin" size={20} /> Loading photos...
          </div>
        ) : (
          <div className="py-24 text-center text-[#1B3A5C]/60">
            <Images className="mx-auto mb-3" size={36} strokeWidth={1.4} />
            No photos are available in this collection.
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────
          Rendered in a portal on <body> so the site navbar or other stacked layers
          can never cover the top bar or hide the icons. */}
      {activeImage &&
        activeImageIndex !== null &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} photo ${activeImageIndex + 1} of ${visibleImages.length}`}
            className="fixed inset-0 z-[100000] flex flex-col bg-[#08111d] text-white"
            style={{ fontFamily: SANS }}
          >
            {/* Slideshow progress */}
            {isPlayingSlideshow && (
              <div className="absolute left-0 right-0 top-0 z-20 h-0.5 bg-white/10">
                <div
                  key={activeImageIndex}
                  className="gl-progress-bar h-full bg-[#E8185A]"
                  style={{ animation: `gl-progress ${SLIDESHOW_MS}ms linear forwards` }}
                />
              </div>
            )}

            {/* Top bar */}
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <button onClick={closeLightbox} className={iconBtn} aria-label="Close gallery viewer" title="Close">
                  <X size={24} strokeWidth={1.75} />
                </button>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-white/50">
                    {activeImageIndex + 1} / {visibleImages.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={(e) => toggleLike(e, activeImage.url)}
                  title={likedMap[activeImage.url] ? 'Favourited' : 'Favourite'}
                  aria-label="Favourite photo"
                  aria-pressed={!!likedMap[activeImage.url]}
                  className={iconBtn}
                >
                  <Heart
                    size={22}
                    strokeWidth={1.75}
                    className={likedMap[activeImage.url] ? 'fill-[#E8185A] text-[#E8185A]' : ''}
                  />
                </button>

                <button
                  onClick={(e) =>
                    handleDownload(
                      e,
                      activeImage.videoUrl || activeImage.url,
                      getFileName(activeImageIndex, activeImage.caption, activeImage.videoUrl || activeImage.url)
                    )
                  }
                  disabled={downloading}
                  title="Download"
                  aria-label="Download photo"
                  className={iconBtn}
                >
                  {downloading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <Download size={22} strokeWidth={1.75} />
                  )}
                </button>

                <button
                  onClick={(e) => handleShare(e, activeImage.videoUrl || activeImage.url, activeImage.caption || item.title)}
                  title="Share"
                  aria-label="Share photo"
                  className={`${iconBtn} relative`}
                >
                  {copied ? (
                    <Check size={22} className="text-green-400" />
                  ) : (
                    <Share2 size={22} strokeWidth={1.75} />
                  )}
                  {copied && (
                    <span className="absolute -bottom-7 right-0 whitespace-nowrap rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-[#1B3A5C] shadow">
                      Link copied
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsPlayingSlideshow((v) => !v)}
                  title={isPlayingSlideshow ? 'Pause slideshow' : 'Play slideshow'}
                  aria-label={isPlayingSlideshow ? 'Pause slideshow' : 'Play slideshow'}
                  aria-pressed={isPlayingSlideshow}
                  className={`${iconBtn} ${isPlayingSlideshow ? 'bg-[#E8185A] text-white hover:bg-[#E8185A]' : ''}`}
                >
                  {isPlayingSlideshow ? (
                    <Pause size={22} strokeWidth={1.75} className="fill-current" />
                  ) : (
                    <Play size={22} strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </header>

            {/* Photo (swipe on touch screens) */}
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-2 sm:px-24"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {activeImageIndex > 0 && (
                <button
                  onClick={goPrev}
                  className={`${iconBtn} absolute left-1 top-1/2 z-10 h-12 w-12 -translate-y-1/2 bg-white/5 sm:left-5`}
                  aria-label="Previous photo"
                  title="Previous"
                >
                  <ChevronLeft size={32} strokeWidth={1.5} />
                </button>
              )}

              <div className="relative flex w-full max-w-6xl items-center justify-center self-stretch">
                {activeImage.mediaType === 'video' && activeImage.videoUrl ? (
                  <video
                    key={activeImage.videoUrl}
                    src={activeImage.videoUrl}
                    poster={activeImage.thumbnailUrl || activeImage.url}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    onLoadedData={() => setLoadedUrl(activeImage.url)}
                    className="max-h-full max-w-full rounded-md bg-black object-contain"
                  />
                ) : (
                  <>
                    {!activeLoaded && (
                      <div className="absolute inset-0 z-0 flex items-center justify-center text-white/30">
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
                  </>
                )}
              </div>

              {activeImageIndex < visibleImages.length - 1 && (
                <button
                  onClick={goNext}
                  className={`${iconBtn} absolute right-1 top-1/2 z-10 h-12 w-12 -translate-y-1/2 bg-white/5 sm:right-5`}
                  aria-label="Next photo"
                  title="Next"
                >
                  <ChevronRight size={32} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Caption + counter */}
            <footer className="shrink-0 px-4 pb-2 pt-3 text-center">
              {activeImage.caption && (
                <p className="mx-auto mb-1 max-w-2xl text-sm leading-snug text-white/85">
                  {activeImage.caption}
                </p>
              )}
              <p className="text-xs text-white/45 sm:hidden">
                {activeImageIndex + 1} / {visibleImages.length}
              </p>
            </footer>

            {/* Filmstrip (desktop / tablet) */}
            {visibleImages.length > 1 && (
              <div className="hidden shrink-0 border-t border-white/10 bg-black/30 px-4 py-2.5 md:block">
                <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto">
                  {visibleImages.map((image, index) => (
                    <button
                      key={image._id || image.referenceId || image.publicId || index}
                      id={`filmstrip-${index}`}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Go to photo ${index + 1}`}
                      aria-current={index === activeImageIndex}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded transition ${
                        index === activeImageIndex
                          ? 'ring-2 ring-[#E8185A] ring-offset-2 ring-offset-[#08111d]'
                          : 'opacity-50 hover:opacity-100'
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