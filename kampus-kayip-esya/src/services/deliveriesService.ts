import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { CreateDeliveryRequest, DeliveryRecord } from '../types/delivery';

/**
 * deliveriesService — Teslim işlemi API çağrıları.
 *
 * Teslim oluşturma işlemi backend'de otomatik olarak:
 * - İlgili eşyanın durumunu DELIVERED yapar
 * - İlgili talebin durumunu COMPLETED yapar
 * - Öğrenciye bildirim gönderir
 */
export const deliveriesService = {
  // Tüm teslim kayıtlarını listele
  getDeliveries(token?: string | null) {
    return apiClient.get<DeliveryRecord[]>(
      ENDPOINTS.deliveries.list,
      token
    );
  },

  // Tek teslim detayı
  getDeliveryById(deliveryId: number, token?: string | null) {
    return apiClient.get<DeliveryRecord>(
      ENDPOINTS.deliveries.detail(deliveryId),
      token
    );
  },

  // Yeni teslim oluştur (admin)
  createDelivery(payload: CreateDeliveryRequest, token?: string | null) {
    return apiClient.post<DeliveryRecord>(
      ENDPOINTS.deliveries.create,
      payload,
      token
    );
  },
};
