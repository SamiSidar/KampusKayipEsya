package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    /** Kullanıcının aktif (süresi dolmamış) token'ı var mı? */
    boolean existsByUserIdAndExpiresAtAfter(Long userId, LocalDateTime now);

    /** Kullanıcının tüm token'larını sil (yeni token oluşturmadan önce). */
    void deleteByUserId(Long userId);

    /** Süresi dolmuş token'ları temizle (opsiyonel bakım). */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);
}
