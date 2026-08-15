package com.yeditepe.kampuskayipesya.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RefreshToken — Refresh token entity.
 *
 * Access token 15 dakika geçerlidir. Süresi dolduğunda
 * bu refresh token ile yeni access token alınır.
 * Refresh token 7 gün geçerlidir ve her kullanımda rotate edilir
 * (eski token silinir, yeni token üretilir — token çalınma koruması).
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_token", columnList = "token"),
        @Index(name = "idx_refresh_user", columnList = "user_id")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Token family — aynı aileden gelen token'ları takip eder (replay detection) */
    @Column(nullable = false, length = 36)
    private String family;

    /** Bu token kullanıldı mı? Kullanılmış token tekrar kullanılırsa tüm aile silinir. */
    @Column(nullable = false)
    private boolean revoked = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    // ==================== GETTER ve SETTER ====================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getFamily() { return family; }
    public void setFamily(String family) { this.family = family; }

    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
}
