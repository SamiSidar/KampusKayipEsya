import { ApiDateString, ApiId, UserRole } from './common';

// ============================================================
// Kullanıcı tipleri.
//
// UserSummary : listelerde/ilişkili kayıtlarda görünen kısa kullanıcı bilgisi
// UserProfile : profil ekranında kullanılan tam bilgi
//
// getUserRoleLabel() rol kodunu ekranda gösterilecek Türkçe metne çevirir
// (STUDENT → 'Öğrenci'). Kod hep İngilizce, ekran metni Türkçe kalır.
// ============================================================

// Backend'den dönen UserResponse yapısı (ortak referans tipi)
export type UserSummary = {
  id: ApiId;
  fullName: string;
  email: string;
  username: string;
  role: UserRole;
  studentNumber?: string;
  phoneNumber?: string;
  department?: string;
  createdAt?: ApiDateString;
};

export type UserProfile = {
  id: ApiId;
  fullName: string;
  email: string;
  role: UserRole;
  studentNumber?: string;
  phoneNumber?: string;
  department?: string;
  createdAt?: ApiDateString;
};

export type UpdateUserProfileRequest = {
  fullName?: string;
  phoneNumber?: string;
  department?: string;
};

export function getUserRoleLabel(role: UserRole) {
  switch (role) {
    case 'STUDENT':
      return 'Öğrenci';

    case 'ADMIN':
      return 'Yönetici';

    case 'SECURITY':
      return 'Güvenlik';

    default:
      return 'Kullanıcı';
  }
}