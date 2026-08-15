import { API_BASE_URL } from '../api/apiClient';

/**
 * uploadService — Dosya yükleme servisi.
 *
 * Backend'e multipart/form-data ile dosya gönderir.
 * apiClient JSON-only olduğu için ayrı bir servis olarak yazıldı.
 */

type UploadResponse = {
  url: string;
};

export const uploadService = {
  /**
   * Fotoğrafı backend'e yükler ve URL döner.
   *
   * @param imageUri - expo-image-picker'dan gelen URI (file:// veya content://)
   * @param token - JWT token
   * @returns Yüklenen dosyanın URL'i (örn: /api/uploads/abc-123.jpg)
   */
  async uploadImage(
    imageUri: string,
    token?: string | null
  ): Promise<string> {
    const formData = new FormData();

    // URI'den dosya adı ve tipi çıkar
    const fileName = imageUri.split('/').pop() || 'photo.jpg';
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType =
      extension === 'png'
        ? 'image/png'
        : extension === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

    // React Native FormData için özel format
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Content-Type'ı EKLEMİYORUZ — fetch otomatik boundary ekler
      },
      body: formData,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.message || 'Dosya yüklenemedi.');
    }

    // Backend ApiResponse wrapper: { data: { url: "/api/uploads/xxx.jpg" } }
    const data: UploadResponse = json.data;
    return data.url;
  },

  /**
   * Backend'deki relative URL'i tam URL'e çevirir.
   * Görsel gösterirken kullanılır.
   */
  getFullImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    // API_BASE_URL = http://localhost:8080/api
    // relativeUrl  = /api/uploads/xxx.jpg
    // Sonuç        = http://localhost:8080/api/uploads/xxx.jpg
    const baseOrigin = API_BASE_URL.replace(/\/api$/, '');
    return `${baseOrigin}${relativeUrl}`;
  },
};
