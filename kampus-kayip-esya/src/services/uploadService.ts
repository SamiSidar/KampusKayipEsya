import { Platform } from 'react-native';
import { API_BASE_URL } from '../api/apiClient';

/**
 * uploadService — Dosya yükleme servisi.
 *
 * Backend'e multipart/form-data ile dosya gönderir.
 * Web ve mobil platformlar için ayrı FormData stratejisi kullanır.
 */

type UploadResponse = {
  url: string;
};

export const uploadService = {
  /**
   * Fotoğrafı backend'e yükler ve URL döner.
   */
  async uploadImage(
    imageUri: string,
    token?: string | null
  ): Promise<string> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // Web: blob: veya data: URI'yi Blob'a çevir
      const fetchResponse = await fetch(imageUri);
      const originalBlob = await fetchResponse.blob();

      // Blob'un tipini kontrol et, yoksa image/jpeg varsay
      const mimeType = originalBlob.type && originalBlob.type.startsWith('image/')
        ? originalBlob.type
        : 'image/jpeg';

      // Doğru MIME tipiyle yeni blob oluştur
      const blob = new Blob([originalBlob], { type: mimeType });

      // MIME tipine göre uzantı belirle
      const extMap: Record<string, string> = {
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'image/jpeg': '.jpg',
      };
      const ext = extMap[mimeType] || '.jpg';
      const fileName = `photo_${Date.now()}${ext}`;

      formData.append('file', blob, fileName);
    } else {
      // React Native: özel { uri, name, type } formatı
      const fileName = imageUri.split('/').pop() || 'photo.jpg';
      const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType =
        extension === 'png'
          ? 'image/png'
          : extension === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.message || 'Dosya yüklenemedi.');
    }

    const data: UploadResponse = json.data;
    return data.url;
  },

  getFullImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const baseOrigin = API_BASE_URL.replace(/\/api$/, '');
    return `${baseOrigin}${relativeUrl}`;
  },
};
