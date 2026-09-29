'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Images, Loader2 } from 'lucide-react';
import { galleryApi } from '@/lib/api/gallery';
import type { GalleryItem } from '@/types';

export default function GalleryCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-8 text-[#202a24] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/Gallery"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#386b4e] hover:text-[#1e4a34]"
        >
          <ArrowLeft size={17} /> Back to collections
        </Link>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center gap-3 text-[#52645a]">
            <Loader2 className="animate-spin" size={22} /> Loading collection...
          </div>
        ) : error || !item ? (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold">{error || 'Gallery not found.'}</p>
          </div>
        ) : (
          <>
            <header className="mb-8 border-b border-[#d8ddd6] pb-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b34c53]">
                {item.category} · {item.mediaType === 'folder' ? `${images.length} photos` : 'Video'}
              </p>
              <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-5xl">
                {item.title}
              </h1>
              {item.caption && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b665e]">{item.caption}</p>
              )}
            </header>

            {item.mediaType === 'video' ? (
              <video
                className="mx-auto max-h-[75vh] w-full max-w-5xl bg-black"
                src={item.videoUrl}
                poster={item.thumbnailUrl}
                controls
                playsInline
              />
            ) : images.length ? (
              <section aria-label={`${item.title} photos`} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => (
                  <figure key={image._id || image.referenceId || image.publicId || index} className="overflow-hidden bg-white">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                      src={image.url}
                      alt={image.caption || `${item.title}, photo ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading={index < 6 ? 'eager' : 'lazy'}
                      className="object-cover"
                      />
                    </div>
                    {image.caption && (
                      <figcaption className="px-3 py-2 text-sm text-[#5b665e]">{image.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </section>
            ) : (
              <div className="py-20 text-center text-[#69766d]">
                <Images className="mx-auto mb-3" size={32} />
                No photos are available in this collection.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}