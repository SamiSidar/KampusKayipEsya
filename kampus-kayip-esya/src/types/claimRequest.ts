import { ApiDateString, ApiId } from './common';
import { FoundItem } from './foundItem';
import { UserSummary } from './user';

export type ClaimRequestStatus =
  | 'PENDING'
  | 'INFO_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

// Backend'den dönen ClaimRequestResponse yapısı
export type ClaimRequest = {
  id: ApiId;
  item: FoundItem;             // Talep edilen eşya
  student: UserSummary;        // Talep eden öğrenci
  description: string;
  distinguishingFeature: string;
  additionalNote?: string;
  status: ClaimRequestStatus;
  createdAt: ApiDateString;
  reviewedAt?: ApiDateString;
  adminNote?: string;
};

export type CreateClaimRequestRequest = {
  itemId: ApiId;
  description: string;
  distinguishingFeature: string;
  additionalNote?: string;
};

// Backend'in PUT /review endpoint'ine gönderilen yapı
export type ReviewClaimRequestPayload = {
  status: ClaimRequestStatus;
  adminNote?: string;
};

export function getClaimRequestStatusLabel(status: ClaimRequestStatus) {
  switch (status) {
    case 'PENDING':
      return 'İnceleme Bekliyor';

    case 'INFO_REQUESTED':
      return 'Ek Bilgi İstendi';

    case 'APPROVED':
      return 'Onaylandı';

    case 'REJECTED':
      return 'Reddedildi';

    case 'COMPLETED':
      return 'Tamamlandı';

    default:
      return 'Bilinmiyor';
  }
}