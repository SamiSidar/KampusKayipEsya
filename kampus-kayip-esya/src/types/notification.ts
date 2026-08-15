import { ApiDateString, ApiId } from './common';

export type NotificationType =
  | 'REPORT_APPROVED'
  | 'MATCH_FOUND'
  | 'CLAIM_REVIEWING'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'ITEM_DELIVERED'
  | 'REVISION_REQUESTED'
  | 'GENERAL';

export type AppNotification = {
  id: ApiId;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: ApiDateString;
  reportId?: ApiId;
  itemId?: ApiId;
  claimId?: ApiId;
  deliveryId?: ApiId;
};

export type MarkNotificationReadRequest = {
  notificationId: ApiId;
};

export function getNotificationTypeLabel(type: NotificationType) {
  switch (type) {
    case 'REPORT_APPROVED':
      return 'Bildiri Onaylandı';

    case 'MATCH_FOUND':
      return 'Benzer Eşya Bulundu';

    case 'CLAIM_REVIEWING':
      return 'Talep İnceleniyor';

    case 'CLAIM_APPROVED':
      return 'Talep Onaylandı';

    case 'CLAIM_REJECTED':
      return 'Talep Reddedildi';

    case 'ITEM_DELIVERED':
      return 'Eşya Teslim Edildi';

    case 'REVISION_REQUESTED':
      return 'Düzenleme İstendi';

    case 'GENERAL':
      return 'Genel Bildirim';

    default:
      return 'Bildirim';
  }
}