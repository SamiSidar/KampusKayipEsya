import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { AppNotification } from '../types/notification';

/**
 * notificationsService — Bildirim API çağrıları.
 *
 * Backend PUT metodu kullanıyor (okundu işaretleme).
 */
export const notificationsService = {
  // Tüm bildirimler
  getNotifications(token?: string | null) {
    return apiClient.get<AppNotification[]>(
      ENDPOINTS.notifications.list,
      token
    );
  },

  // Sadece okunmamışlar
  getUnreadNotifications(token?: string | null) {
    return apiClient.get<AppNotification[]>(
      ENDPOINTS.notifications.unread,
      token
    );
  },

  // Okunmamış bildirim sayısı
  getUnreadCount(token?: string | null) {
    return apiClient.get<number>(
      ENDPOINTS.notifications.unreadCount,
      token
    );
  },

  // Tek bildirimi okundu işaretle (PUT)
  markAsRead(notificationId: number, token?: string | null) {
    return apiClient.put<AppNotification>(
      ENDPOINTS.notifications.markAsRead(notificationId),
      undefined,
      token
    );
  },

  // Tümünü okundu işaretle (PUT)
  markAllAsRead(token?: string | null) {
    return apiClient.put<void>(
      ENDPOINTS.notifications.markAllAsRead,
      undefined,
      token
    );
  },
};
