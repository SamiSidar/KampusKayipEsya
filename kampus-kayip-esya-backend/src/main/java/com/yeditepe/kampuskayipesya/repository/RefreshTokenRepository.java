package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    /** Kullanıcının tüm refresh token'larını sil (logout) */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    /** Aynı ailedeki tüm token'ları revoke et (replay attack koruması) */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.family = :family")
    void revokeFamily(@Param("family") String family);

    /** Aynı ailedeki tüm token'ları sil */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.family = :family")
    void deleteByFamily(@Param("family") String family);

    /** Süresi dolmuş token'ları temizle (scheduled cleanup) */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
}
