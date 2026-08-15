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
