// ============================================================
// Ortak tipler — birden fazla yerde tekrarlanan temel tanımlar.
//
// ApiId / ApiDateString gibi takma adlar (alias) kodun okunmasını
// kolaylaştırır: 'string' yerine 'ApiDateString' görünce bunun backend'den
// gelen bir tarih metni olduğu anlaşılır.
// ============================================================

export type ApiId = number;

export type ApiDateString = string;

export type UserRole = 'STUDENT' | 'ADMIN' | 'SECURITY';

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
};

export type ApiErrorResponse = {
  message: string;
  status?: number;
  path?: string;
};

export type SelectOption = {
  label: string;
  value: string;
};
