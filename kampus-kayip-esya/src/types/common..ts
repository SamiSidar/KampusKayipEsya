export type ApiId = number;

export type ApiDateString = string;

export type UserRole = 'STUDENT' | 'ADMIN' | 'SECURITY';

// Backend'in döndürdüğü standart cevap yapısı.
// apiClient bu wrapper'ı otomatik açar, servisler direkt data'yı alır.
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