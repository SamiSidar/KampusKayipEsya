import { ApiDateString, ApiId } from './common';
import { FoundItem } from './foundItem';
import { ClaimRequest } from './claimRequest';
import { UserSummary } from './user';

// ============================================================
// Teslim kaydı tipleri.
//
// Bir teslim kaydı, onaylanmış bir teslim talebinin fiziksel olarak
// tamamlandığını belgeler.
// ============================================================

// Backend'den dönen DeliveryResponse yapısı
export type DeliveryRecord = {
  id: ApiId;
  item: FoundItem;
  claim?: ClaimRequest;
  deliveredToName: string;
  deliveredToStudentNumber?: string;
  deliveredBy: UserSummary;
  deliveredAt: ApiDateString;
  adminNote?: string;
};

// Backend'in POST /deliveries endpoint'ine gönderilen yapı
export type CreateDeliveryRequest = {
  itemId: ApiId;
  claimId?: ApiId;
  deliveredToName: string;
  deliveredToStudentNumber?: string;
  adminNote?: string;
};
