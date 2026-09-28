// app/components/GalleryManager.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { galleryApi } from '@/lib/api/gallery';
import { GalleryItem } from '@/types';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import {
  Folder,
  Video,
  Plus,
  Trash2,
  Filter,
  Search,
  Tag,
  Loader2,
  AlertCircle,
  Eye,
  User,
  Calendar,
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
  portalTitle?: string;
  portalDescription?: string;
}

export default function GalleryManager({
  portalTitle = 'Gallery Management',
  portalDescription = 'Upload, filter, and manage public media collections and HD videos.',
}: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [mediaType, setMediaType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      const res = await galleryApi.getItems({ category, mediaType, search });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch gallery items:', err);
    } finally {
      setLoading(false);
    }
  }, [category, mediaType, search]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this media item? Cloudinary CDN assets will be physically purged.'
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      await galleryApi.deleteItem(id);
      loadGallery();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete gallery item.';
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (item: GalleryItem) => {
    const nextPublished = !(item.isPublished || item.status === 'published');
    setPublishingId(item._id);

    try {
      if (nextPublished) {
        await galleryApi.publishItem(item._id);
      } else {
        await galleryApi.unpublishItem(item._id);
      }
      await loadGallery();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update website publishing status.';
      alert(message);
    } finally {
      setPublishingId(null);
    }
  };

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: 'var(--font-body)' };
  const displayFont: React.CSSProperties = { fontFamily: 'var(--font-display)' };
  const monoFont: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

  return (
    <div className={`${fontVars} space-y-6 text-[#1E2620]`} style={bodyFont}>
      {/* Portal Header */}
      <div className="border-b border-[#D9D4C6] bg-[#F3F2ED] p-6 rounded-sm shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[9px] uppercase tracking-[0.16em] text-[#8B9188]" style={monoFont}>
            BioCap Media Archives
          </p>
          <h1 className="text-2xl font-bold italic leading-tight text-[#1E2620]" style={displayFont}>
            {portalTitle}
          </h1>
          <p className="text-xs text-[#5A6259]">{portalDescription}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] cursor-pointer shrink-0"
        >
          <Plus size={14} /> Add New Media
        </button>
      </div>

      {/* Action Bar & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF9F5] p-4 rounded-sm border border-[#D9D4C6]">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2 border border-[#D9D4C6] bg-white px-3 py-1.5 rounded-sm">
            <Filter size={13} className="text-[#8B9188]" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#1E2620] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="activities">Activities</option>
              <option value="events">Events</option>
              <option value="team">Team</option>
            </select>
          </div>

          {/* Media Type Filter */}
          <div className="flex items-center gap-2 border border-[#D9D4C6] bg-white px-3 py-1.5 rounded-sm">
            <Tag size={13} className="text-[#8B9188]" />
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#1E2620] focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="folder">Image Folders</option>
              <option value="video">HD Videos</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 border border-[#D9D4C6] bg-white px-3 py-1.5 rounded-sm w-full sm:w-56">
            <Search size={13} className="text-[#8B9188]" />
            <input
              type="text"
              placeholder="Search title or caption..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-[#1E2620] placeholder-[#8B9188] focus:outline-none w-full"
            />
          </div>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A9812F]" style={monoFont}>
          Showing {items.length} records
        </span>
      </div>

      {/* Dashboard Records Table */}
      <div className="border border-[#D9D4C6] bg-white rounded-sm overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-[#8B9188] space-y-3">
            <Loader2 size={24} className="animate-spin text-[#3F6B4F]" />
            <p className="text-xs font-medium italic" style={displayFont}>
              Loading gallery media archives...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-[#8B9188] space-y-2">
            <AlertCircle size={24} className="mx-auto text-[#C22055]" />
            <p className="text-xs font-medium italic" style={displayFont}>
              No media records found matching your active filter choices.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D9D4C6] bg-[#F3F2ED] text-[#5A6259] uppercase tracking-wider font-semibold" style={monoFont}>
                <tr>
                  <th className="p-4 text-[10px]">Preview</th>
                  <th className="p-4 text-[10px]">Title & Description</th>
                  <th className="p-4 text-[10px]">Category</th>
                  <th className="p-4 text-[10px]">Media Type</th>
                  <th className="p-4 text-[10px]">Uploaded By</th>
                  <th className="p-4 text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE0]">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-[#FAF9F5] transition-colors">
                    {/* Media Thumbnail */}
                    <td className="p-4">
                      <div className="relative h-12 w-20 overflow-hidden border border-[#D9D4C6] bg-[#1E2620] rounded-xs group">
                        <img
                          src={item.mediaType === 'video' ? item.thumbnailUrl : item.images?.[0]?.url}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span
                          className="absolute bottom-1 right-1 border border-white/20 bg-[#1E2620]/80 p-0.5 text-white backdrop-blur-xs rounded-xs"
                        >
                          {item.mediaType === 'video' ? <Video size={10} /> : <Folder size={10} />}
                        </span>
                      </div>
                    </td>

                    {/* Content Details */}
                    <td className="p-4">
                      <div className="font-bold text-[#1E2620] leading-snug">{item.title}</div>
                      <div className="text-[#6B7268] text-[11px] line-clamp-1 mt-0.5 italic">
                        "{item.caption}"
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 border border-[#D9D4C6] bg-[#FAF9F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A9812F]" style={monoFont}>
                        {item.category}
                      </span>
                    </td>

                    {/* Media Type */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E2620]">
                        {item.mediaType === 'folder' ? (
                          <>
                            <Folder size={13} className="text-[#3F6B4F]" />
                            Folder ({item.images?.length || 0})
                          </>
                        ) : (
                          <>
                            <Video size={13} className="text-[#C22055]" />
                            HD Video
                          </>
                        )}
                      </span>
                    </td>

                    {/* Creator */}
                    <td className="p-4 text-[11px] text-[#6B7268]">
                      <span className="inline-flex items-center gap-1">
                        <User size={12} className="text-[#8B9188]" />
                        {item.createdBy?.username || 'System User'}
                      </span>
                    </td>

                    {/* Publish / Delete Actions */}
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            item.isPublished || item.status === 'published'
                              ? 'border-[#3F6B4F] bg-[#EAF5EE] text-[#1F4D39]'
                              : 'border-[#D9D4C6] bg-[#FAF9F5] text-[#6B7268]'
                          }`}
                          style={monoFont}
                        >
                          {item.isPublished || item.status === 'published' ? 'Published' : 'Draft'}
                        </span>

                        <button
                          type="button"
                          disabled={publishingId === item._id || deletingId === item._id}
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center gap-1 border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer ${
                            item.isPublished || item.status === 'published'
                              ? 'border-[#8B4136] bg-[#FBEEEC] text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5]'
                              : 'border-[#3F6B4F] bg-[#EAF5EE] text-[#1F4D39] hover:bg-[#3F6B4F] hover:text-[#FAF9F5]'
                          }`}
                          style={monoFont}
                        >
                          {publishingId === item._id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : item.isPublished || item.status === 'published' ? (
                            <Eye size={12} />
                          ) : (
                            <Plus size={12} />
                          )}
                          {publishingId === item._id
                            ? 'Updating...'
                            : item.isPublished || item.status === 'published'
                              ? 'Unpublish'
                              : 'Publish to Website'}
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === item._id}
                          onClick={() => handleDelete(item._id)}
                          className="inline-flex items-center gap-1 border border-[#B65C4B]/40 bg-[#FBEEEC] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8B4136] transition-colors hover:bg-[#8B4136] hover:text-[#FAF9F5] hover:border-[#8B4136] disabled:opacity-50 cursor-pointer"
                          style={monoFont}
                        >
                          {deletingId === item._id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal Container */}
      {isModalOpen && (
        <GalleryUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadGallery}
        />
      )}
    </div>
  );
}