'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { Newspaper, Calendar, User as UserIcon, Tag, Share2 } from 'lucide-react';

const TAG_ACCENTS = ['#2A7F8C', '#7B3FA0', '#C22055', '#2F8F5B', '#D97706', '#1B3A5C', '#0891B2', '#B45309'];
const accentForTag = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TAG_ACCENTS[hash % TAG_ACCENTS.length];
};

interface ArticleSidebarProps {
  story: BlogPost;
  eventLabel?: string;
  publishedLabel: string | null;
  organizer?: string;
  authorDisplayByline: string;
  keyPartners?: string[];
  moreStories: BlogPost[];
  onOpenShareModal: () => void;
}

export default function ArticleSidebar({
  story,
  eventLabel,
  publishedLabel,
  organizer,
  authorDisplayByline,
  keyPartners,
  moreStories,
  onOpenShareModal,
}: ArticleSidebarProps) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-6">
      <div className="rounded-2xl border border-[#e2e8f3] bg-white p-5 shadow-sm">
        <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#1B3A5C] mb-4">
          <Newspaper size={13} className="text-[#C22055]" /> {eventLabel ? 'Event Details' : 'Story Details'}
        </p>
        <div className="space-y-3 text-xs text-slate-600">
          {eventLabel ? (
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#C22055] shrink-0" />
              <span className="font-semibold text-[#1B3A5C]">{eventLabel}</span>
            </div>
          ) : (
            publishedLabel && (
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-[#C22055] shrink-0" />
                <span>{publishedLabel}</span>
              </div>
            )
          )}
          <div className="flex items-center gap-2">
            <UserIcon size={13} className="text-[#C22055] shrink-0" />
            <span>{organizer || authorDisplayByline}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-[#C22055] shrink-0" />
            <span>{story.tag || 'General'}</span>
          </div>
        </div>

        {keyPartners && keyPartners.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8B9188] mb-2">Key Partners</p>
            <p className="text-xs font-medium text-[#1B3A5C] leading-relaxed text-justify">
              {keyPartners.join(' \u00B7 ')}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenShareModal}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#1B3A5C]/20 py-2 text-[11px] font-bold uppercase tracking-widest text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white transition cursor-pointer"
        >
          <Share2 size={13} /> Share Article
        </button>
      </div>

      {moreStories.length > 0 && (
        <div className="rounded-2xl border border-[#e2e8f3] bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#1B3A5C] mb-4">More Stories</p>
          <div className="space-y-4">
            {moreStories.map((s) => {
              const accent = accentForTag(s.tag || s.title);
              return (
                <Link key={s._id} href={`/Stewardship-News/${s.slug}`} className="flex items-center gap-3 group">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {s.img ? (
                      <img src={s.img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: `${accent}22` }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wide mb-0.5" style={{ color: accent }}>
                      {s.tag || 'General'}
                    </p>
                    <p className="text-[13px] font-semibold text-[#1B3A5C] leading-snug line-clamp-2 group-hover:text-[#C22055] transition-colors">
                      {s.title}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}