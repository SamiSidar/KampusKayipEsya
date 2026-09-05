package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtService — JWT token üretimi ve doğrulaması.
 *
 * Token'ın içinde kullanıcının id'si ve rolü taşınır; böylece her istekte
 * veritabanına sormaya gerek kalmaz.
 *
 * İki tür token vardır:
 * - Access token  : kısa ömürlü (15 dk), her istekte gönderilir
 * - Refresh token : uzun ömürlü (7 gün), access token bitince yenisini alır
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    /** HMAC-SHA256 için minimum anahtar uzunluğu (32 karakter = 256 bit) */
    private static final int MIN_SECRET_LENGTH = 32;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    /**
     * Uygulama başlarken JWT secret'ın geçerliliğini kontrol eder.
     * Secret boşsa veya çok kısaysa uygulama başlamaz.
     */
    @PostConstruct
    public void validateSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable tanımlı değil! " +
                    "Uygulama güvenli bir secret olmadan başlatılamaz. " +
                    "Örnek: export JWT_SECRET=<en_az_32_karakter_güçlü_anahtar>");
        }
        if (jwtSecret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JWT_SECRET çok kısa (" + jwtSecret.length() + " karakter). " +
                    "Minimum " + MIN_SECRET_LENGTH + " karakter (256-bit) gereklidir.");
        }
        log.info("JWT secret doğrulandı ({} karakter)", jwtSecret.length());
    }

    /**
     * Access token üretir (15 dakika geçerli).
     * Bu token API çağrılarında kullanılır.
     */
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        claims.put("fullName", user.getFullName());
        claims.put("tokenType", "access");

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * @deprecated Eski tek-token yapısı. Yeni kod generateAccessToken kullanmalı.
     */
    @Deprecated
    public String generateToken(User user) {
        return generateAccessToken(user);
    }

    /** Refresh token süresini milisaniye olarak döner */
    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpiration;
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractAllClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /**
     * Token geçerli mi kontrol eder.
     * ExpiredJwtException ve JwtException fırlatabilir — çağıran taraf
     * (JwtAuthFilter) bu exception'ları yakalayıp uygun hata mesajı döner.
     */
    public boolean isTokenValid(String token) {
        Claims claims = extractAllClaims(token);
        return !claims.getExpiration().before(new Date());
    }

    /**
     * Token'ı tek seferde parse edip tüm claim'leri döner.
     * Geçerliyse Claims, geçersizse (süresi dolmamış ama invalid) null döner.
     * ExpiredJwtException ve JwtException fırlatabilir.
     *
     * JwtAuthFilter bu metodu kullanır — 3 ayrı parse yerine tek parse.
     */
    public Claims extractAllClaimsIfValid(String token) {
        Claims claims = extractAllClaims(token);
        if (claims.getExpiration().before(new Date())) {
            return null;
        }
        return claims;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
}