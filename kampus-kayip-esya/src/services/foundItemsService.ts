import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import {
  CreateFoundItemRequest,
  FoundItem,
  FoundItemCategory,
  FoundItemStatus,
  UpdateFoundItemRequest,
} from '../types/foundItem';

/**
 * foundItemsService — Bulunan eşya API çağrıları.
 *
 * Backend GET /found-items endpoint'i query parametreleri kabul eder:
 *   ?status=WAITING_OWNER  → duruma göre filtrele
 *   ?category=WALLET       → kategoriye göre filtrele
 *   ?search=cuzdan         → başlık/açıklamada ara
 */
export const foundItemsService = {
  // Tüm eşyaları listele
  getFoundItems(token?: string | null) {
    return apiClient.get<FoundItem[]>(ENDPOINTS.foundItems.list, token);
  },

  // Duruma göre filtrele (ör: sadece sahibi beklenenler)
  getByStatus(status: FoundItemStatus, token?: string | null) {
    return apiClient.get<FoundItem[]>(
      `${ENDPOINTS.foundItems.list}?status=${status}`,
      token
    );
  },

  // Kategoriye göre filtrele
  getByCategory(category: FoundItemCategory, token?: string | null) {
    return apiClient.get<FoundItem[]>(
      `${ENDPOINTS.foundItems.list}?category=${category}`,
      token
    );
  },

  // Metin araması
  search(query: string, token?: string | null) {
    return apiClient.get<FoundItem[]>(
      `${ENDPOINTS.foundItems.list}?search=${encodeURIComponent(query)}`,
      token
    );
  },

  // Tek eşya detayı
  getFoundItemById(itemId: number, token?: string | null) {
    return apiClient.get<FoundItem>(
      ENDPOINTS.foundItems.detail(itemId),
      token
    );
  },

  // Yeni eşya oluştur (admin)
  createFoundItem(payload: CreateFoundItemRequest, token?: string | null) {
    return apiClient.post<FoundItem>(
      ENDPOINTS.foundItems.create,
      payload,
      token
    );
  },

  // Eşya güncelle (admin)
  updateFoundItem(
    itemId: number,
    payload: UpdateFoundItemRequest,
    token?: string | null
  ) {
    return apiClient.put<FoundItem>(
      ENDPOINTS.foundItems.update(itemId),
      payload,
      token
    );
  },
};
