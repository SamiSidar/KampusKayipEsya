import { ApiDateString, ApiId } from './common';
import { UserSummary } from './user';

export type FoundItemStatus =
  | 'WAITING_OWNER'
  | 'CLAIM_REQUESTED'
  | 'DELIVERED'
  | 'ARCHIVED';

export type FoundItemCategory =
  | 'WALLET'
  | 'KEY'
  | 'CARD'
  | 'ELECTRONIC'
  | 'BAG'
  | 'ACCESSORY'
  | 'OTHER';

export type FoundItem = {
  id: ApiId;
  title: string;
  category: FoundItemCategory;
  location: string;
  foundDate: ApiDateString;
  status: FoundItemStatus;
  imageUrl?: string;
  description?: string;
  storageLocation?: string;
  createdBy?: UserSummary;
  createdAt?: ApiDateString;
  deliveredAt?: ApiDateString;
};

export type CreateFoundItemRequest = {
  title: string;
  category: FoundItemCategory;
  location: string;
  foundDate: ApiDateString;
  description?: string;
  storageLocation?: string;
  imageUrl?: string;
};

export type UpdateFoundItemRequest = {
  title?: string;
  category?: FoundItemCategory;
  location?: string;
  foundDate?: ApiDateString;
  description?: string;
  storageLocation?: string;
  imageUrl?: string;
  status?: FoundItemStatus;
};

export function getFoundItemStatusLabel(status: FoundItemStatus) {
  switch (status) {
    case 'WAITING_OWNER':
      return 'Sahibi Bekleniyor';

    case 'CLAIM_REQUESTED':
      return 'Teslim Talebi Var';

    case 'DELIVERED':
      return 'Teslim Edildi';

    case 'ARCHIVED':
      return 'Arşivlendi';

    default:
      return 'Bilinmiyor';
  }
}

export function getFoundItemCategoryLabel(category: FoundItemCategory) {
  switch (category) {
    case 'WALLET':
      return 'Cüzdan';

    case 'KEY':
      return 'Anahtar';

    case 'CARD':
      return 'Kimlik / Kart';

    case 'ELECTRONIC':
      return 'Elektronik';

    case 'BAG':
      return 'Çanta';

    case 'ACCESSORY':
      return 'Aksesuar';

    case 'OTHER':
      return 'Diğer';

    default:
      return 'Diğer';
  }
}