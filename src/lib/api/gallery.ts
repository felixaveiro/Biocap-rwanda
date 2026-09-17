// app/lib/api/gallery.ts
import { apiRequest, apiFormRequest } from './client';
import { GalleryItem, GalleryResponse } from '@/types';

export const galleryApi = {
  /**
   * Public: Fetch paginated live gallery items
   */
  async getItems(params?: {
    page?: number;
    limit?: number;
    category?: string;
    mediaType?: string;
    search?: string;
  }): Promise<GalleryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
    if (params?.mediaType && params.mediaType !== 'all') searchParams.append('mediaType', params.mediaType);
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const path = `/api/gallery${queryString ? `?${queryString}` : ''}`;

    return apiRequest<GalleryResponse>(path, { method: 'GET' });
  },

  /**
   * Public: Fetch single item details by ID for permalinks
   */
  async getItemById(id: string): Promise<{ success: boolean; data: GalleryItem }> {
    return apiRequest<{ success: boolean; data: GalleryItem }>(`/api/gallery/${id}`, {
      method: 'GET',
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
   * Admin & Editor Only: Delete item and purge Cloudinary storage
   */
  async deleteItem(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/api/gallery/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};