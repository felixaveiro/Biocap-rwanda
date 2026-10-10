// app/lib/api/gallery.ts
import { apiRequest, apiFormRequest } from './client';
import { GalleryItem, GalleryResponse } from '@/types';

type GalleryListParams = {
  page?: number;
  limit?: number;
  category?: string;
  mediaType?: string;
  search?: string;
};

export interface WebsiteGalleryCollection {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  status?: string;
  itemCount?: number;
  coverUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

async function websiteGalleryRequest<T>(path: string): Promise<T> {
  const response = await fetch(`/api/website-gallery/${path}`, { cache: 'no-store' });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload
      ? String(payload.message)
      : 'Gallery request failed.';
    throw new Error(message);
  }
  return payload as T;
}

const buildQueryString = (params?: GalleryListParams): string => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
  if (params?.mediaType && params.mediaType !== 'all') searchParams.append('mediaType', params.mediaType);
  if (params?.search) searchParams.append('search', params.search);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const galleryApi = {
  async getWebsiteCollections(): Promise<{ items: WebsiteGalleryCollection[] }> {
    return websiteGalleryRequest<{ items: WebsiteGalleryCollection[] }>('collections');
  },

  async getWebsiteCollection(slug: string): Promise<unknown> {
    return websiteGalleryRequest<unknown>(`collections/${encodeURIComponent(slug)}`);
  },

  async getWebsiteCollectionMedia(slug: string): Promise<unknown> {
    return websiteGalleryRequest<unknown>(`collections/${encodeURIComponent(slug)}/media`);
  },

  /**
   * Public: Fetch paginated live (PUBLISHED only) gallery items.
   * Use this on the public website.
   */
  async getItems(params?: GalleryListParams): Promise<GalleryResponse> {
    const path = `/api/gallery${buildQueryString(params)}`;
    return apiRequest<GalleryResponse>(path, { method: 'GET', cache: 'no-store' });
  },

  /**
   * Admin & Editor Only: Fetch ALL gallery items, including unpublished drafts.
   * Use this in the dashboard so unpublished items stay listed and can be re-published.
   */
  async getAdminItems(params?: GalleryListParams): Promise<GalleryResponse> {
    const path = `/api/gallery/admin/list${buildQueryString(params)}`;
    return apiRequest<GalleryResponse>(path, { method: 'GET', cache: 'no-store', auth: true });
  },

  /**
   * Public: Fetch single item details by ID for permalinks
   */
  async getItemById(id: string): Promise<{ success: boolean; data: GalleryItem }> {
    return apiRequest<{ success: boolean; data: GalleryItem }>(`/api/gallery/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });
  },

  /**
   * Admin & Editor Only: Upload new HD video or image collection folder
   */
  async createItem(formData: FormData): Promise<{ success: boolean; data: GalleryItem; shareableUrl: string }> {
    return apiFormRequest<{ success: boolean; data: GalleryItem; shareableUrl: string }>('/api/gallery', {
      method: 'POST',
      formData,
      auth: true, // Attaches JWT Authorization header via authCookies
    });
  },

  /**
   * Admin & Editor Only: Update metadata or append media files
   */
  async updateItem(id: string, formData: FormData): Promise<{ success: boolean; data: GalleryItem }> {
    return apiFormRequest<{ success: boolean; data: GalleryItem }>(`/api/gallery/${id}`, {
      method: 'PUT',
      formData,
      auth: true,
    });
  },

  /**
   * Admin & Editor Only: Make an item visible on the public website
   */
  async publishItem(id: string): Promise<{ success: boolean; data: GalleryItem }> {
    return apiRequest<{ success: boolean; data: GalleryItem }>(`/api/gallery/${id}/publish`, {
      method: 'PATCH',
      auth: true,
    });
  },

  /**
   * Admin & Editor Only: Remove an item from the public website (kept in dashboard)
   */
  async unpublishItem(id: string): Promise<{ success: boolean; data: GalleryItem }> {
    return apiRequest<{ success: boolean; data: GalleryItem }>(`/api/gallery/${id}/unpublish`, {
      method: 'PATCH',
      auth: true,
    });
  },

  /**
   * Admin & Editor Only: Delete item and purge Cloudinary storage
   */
  async deleteItem(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/api/gallery/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};