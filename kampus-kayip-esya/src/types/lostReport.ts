import { ApiDateString, ApiId } from './common';
import { FoundItemCategory, FoundItem } from './foundItem';
import { UserSummary } from './user';

export type LostReportStatus =
  | 'PENDING_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'MATCH_FOUND'
  | 'REJECTED'
  | 'CLOSED';

// Backend'den dönen LostReportResponse yapısı
export type LostReport = {
  id: ApiId;
  title: string;
  category: FoundItemCategory;
  lostLocation: string;
  lostDate: ApiDateString;
  description: string;
  status: LostReportStatus;
  student: UserSummary;       // Bildirimi yapan öğrenci
  imageUrl?: string;
  matchedItem?: FoundItem;    // Eşleşen bulunan eşya (varsa)
  adminNote?: string;
  revisionNote?: string;
  createdAt?: ApiDateString;
  updatedAt?: ApiDateString;
};

export type CreateLostReportRequest = {
  title: string;
  category: FoundItemCategory;
  lostLocation: string;
  lostDate: ApiDateString;
  description: string;
  imageUrl?: string;
};

export type UpdateLostReportRequest = {
  title?: string;
  category?: FoundItemCategory;
  lostLocation?: string;
  lostDate?: ApiDateString;
  description?: string;
  imageUrl?: string;
};

export type RevisionRequestPayload = {
  reportId: ApiId;
  note: string;
  reasons: string[];
};

export function getLostReportStatusLabel(status: LostReportStatus) {
  switch (status) {
    case 'PENDING_REVIEW':
      return 'Onay Bekliyor';

    case 'REVISION_REQUESTED':
      return 'Düzenleme İstendi';

    case 'APPROVED':
      return 'Onaylandı';

    case 'MATCH_FOUND':
      return 'Benzer Eşya Bulundu';

    case 'REJECTED':
      return 'Reddedildi';

    case 'CLOSED':
      return 'Kapatıldı';

    default:
      return 'Bilinmiyor';
  }
}
