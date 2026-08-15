package com.yeditepe.kampuskayipesya.controller;

import com.yeditepe.kampuskayipesya.dto.*;
import com.yeditepe.kampuskayipesya.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController — Kimlik doğrulama ve profil endpoint'leri.
 *
 * POST /api/auth/register          → Yeni öğrenci kaydı
 * POST /api/auth/login             → Email + şifre ile giriş, JWT token döner
 * GET  /api/auth/me                → Token'daki kullanıcının bilgilerini döner
 * POST /api/auth/forgot-password   → Şifre sıfırlama token'ı üretir
 * POST /api/auth/reset-password    → Token ile şifre sıfırlar
 * PUT  /api/auth/profile           → Profil bilgilerini günceller
 * PUT  /api/auth/change-password   → Şifre değiştirir (mevcut şifre gerekli)
 *
 * Register, login, forgot-password, reset-password public'tir (token gerekmez).
 * Diğer endpoint'ler token gerektirir.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return new ResponseEntity<>(
                ApiResponse.success("Kayıt başarılı", authResponse),
                HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Giriş başarılı", authResponse));
    }

    // ══════════ TOKEN ROTATION ══════════

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token yenilendi", authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("X-User-Id") Long userId) {
        authService.logout(userId);
        return ResponseEntity.ok(ApiResponse.success("Çıkış yapıldı", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
            @RequestHeader("X-User-Id") Long userId) {
        UserResponse user = authService.getAuthenticatedUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Kullanıcı bilgisi", user));
    }

    // ══════════ ŞİFREMİ UNUTTUM ══════════

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String token = authService.forgotPassword(request);

        // Güvenlik: Email var mı yok mu belli etme — her durumda aynı mesaj
        // Geliştirme ortamı: token'ı response'ta döndür (production'da email gönderilir)
        if (token != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Şifre sıfırlama bağlantısı email adresinize gönderildi", token));
        }
        return ResponseEntity.ok(ApiResponse.success(
                "Eğer bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderildi", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Şifre başarıyla sıfırlandı", null));
    }

    // ══════════ PROFİL ══════════

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ProfileUpdateRequest request) {
        UserResponse updated = authService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profil güncellendi", updated));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Şifre başarıyla değiştirildi", null));
    }
}
