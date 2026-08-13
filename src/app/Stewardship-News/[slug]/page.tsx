'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { blogsApi } from '@/lib/api/blogs';
import { BlogPost } from '@/types';
import Header from '@/components/Header';

export default function StewardshipArticlePage() {
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  const [story, setStory] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await blogsApi.getPublicBlogBySlug(slug);
        setStory(res);
      } catch (err: unknown) {
        console.error('Failed to load story:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header title={story?.title || 'Story'} subtitle={story?.excerpt || ''} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
        ) : story ? (
          <article className="rounded-2xl bg-white p-6 shadow-sm">
            {story.img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.img} alt={story.title} className="mb-6 w-full rounded-lg object-cover" />
            )}

            <div className="prose max-w-none">
              <h1>{story.title}</h1>
              <p className="text-sm text-slate-500">By {story.originalAuthor?.firstName} {story.originalAuthor?.lastName} • {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : ''}</p>

              {story.blocks && story.blocks.map((b, idx) => {
                if (b.type === 'h2') return <h2 key={idx}>{b.text}</h2>;
                if (b.type === 'quote') return <blockquote key={idx}>{b.text}</blockquote>;
                return <p key={idx}>{b.text}</p>;
              })}
            </div>
          </article>
        ) : (
          <div className="text-sm text-slate-500">Story not found.</div>
        )}
      </main>
    </div>
  );
}
