import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { LoginRequest, LoginResponse, RegisterRequest, AuthUser } from '../types/auth';

// ============================================================
// authService — Kimlik doğrulama ile ilgili tüm API çağrıları.
//
// Kayıt, giriş, çıkış, e-posta doğrulama, şifre sıfırlama ve profil
// güncelleme istekleri buradan geçer.
//
// Not: Bu dosya sadece HTTP isteğini atar. Token'ın saklanması ve
// uygulama genelinde paylaşılması AuthContext'in işidir.
// ============================================================

export const authService = {
  login(payload: LoginRequest) {
    return apiClient.post<LoginResponse>(ENDPOINTS.auth.login, payload);
  },

  register(payload: RegisterRequest) {
    return apiClient.post<void>(ENDPOINTS.auth.register, payload);
  },

  verifyEmail(email: string, code: string) {
    return apiClient.post<void>(ENDPOINTS.auth.verifyEmail, { email, code });
  },

  resendVerification(email: string) {
    return apiClient.post<void>(ENDPOINTS.auth.resendVerification, { email });
  },

  /** Refresh token ile yeni access + refresh token çifti alır */
  refresh(refreshToken: string) {
    return apiClient.post<LoginResponse>(ENDPOINTS.auth.refresh, { refreshToken });
  },

  /** Tüm refresh token'ları siler (logout) */
  logout(token: string) {
    return apiClient.post<void>(ENDPOINTS.auth.logout, undefined, token);
  },

  getMe(token: string) {
    return apiClient.get<AuthUser>(ENDPOINTS.auth.me, token);
  },

  forgotPassword(email: string) {
    return apiClient.post<string | null>(ENDPOINTS.auth.forgotPassword, { email });
  },

  resetPassword(token: string, newPassword: string) {
    return apiClient.post<void>(ENDPOINTS.auth.resetPassword, { token, newPassword });
  },

  updateProfile(token: string, data: { fullName?: string; phoneNumber?: string; department?: string }) {
    return apiClient.put<AuthUser>(ENDPOINTS.auth.profile, data, token);
  },

  changePassword(token: string, currentPassword: string, newPassword: string) {
    return apiClient.put<void>(ENDPOINTS.auth.changePassword, { currentPassword, newPassword }, token);
  },
};
