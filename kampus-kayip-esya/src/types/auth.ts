import { ApiId, UserRole } from './common';

// Backend email + password ile login bekliyor
export type LoginRequest = {
  email: string;
  password: string;
};

// Backend'den dönen AuthResponse yapısı
export type LoginResponse = {
  token: string;
  refreshToken: string;
  user: AuthUser;
  type: string; // "Bearer"
};

export type AuthUser = {
  id: ApiId;
  fullName: string;
  email: string;
  username: string;
  role: UserRole;
  studentNumber?: string;
  phoneNumber?: string;
  department?: string;
  createdAt: string;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentNumber: string;
  phoneNumber?: string;
  department?: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};