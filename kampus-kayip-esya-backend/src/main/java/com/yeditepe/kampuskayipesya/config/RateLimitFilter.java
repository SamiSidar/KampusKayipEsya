package com.yeditepe.kampuskayipesya.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * RateLimitFilter — İstek sayısı sınırlama filtresi.
 *
 * Neden gerekli:
 * - Login endpoint'ine brute force saldırısı engellenir
 * - Register endpoint'ine spam kayıt engellenir
 * - Genel API'ye aşırı istek (DDoS benzeri) engellenir
 *
 * Kurallar:
 * - /api/auth/login  → IP başına dakikada 10 istek
 * - /api/auth/register → IP başına dakikada 5 istek
 * - Diğer API'ler → IP başına dakikada 100 istek
 *
 * Limit aşılınca 429 Too Many Requests döner.
 * Sayaçlar her dakika sıfırlanır.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    // IP bazlı istek sayaçları: key = "IP:endpoint_group"
    private final Map<String, RateLimitEntry> requestCounts = new ConcurrentHashMap<>();

    // Limitler
    private static final int LOGIN_LIMIT = 10;           // dakikada 10
    private static final int REGISTER_LIMIT = 5;         // dakikada 5
    private static final int FORGOT_PASSWORD_LIMIT = 3;  // dakikada 3
    private static final int GENERAL_LIMIT = 100;        // dakikada 100
    private static final long WINDOW_MS = 60_000L;       // 1 dakika

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Sadece API isteklerini kontrol et
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String group;
        int limit;

        if (path.equals("/api/auth/login")) {
            group = "login";
            limit = LOGIN_LIMIT;
        } else if (path.equals("/api/auth/register")) {
            group = "register";
            limit = REGISTER_LIMIT;
        } else if (path.equals("/api/auth/forgot-password")) {
            group = "forgot-password";
            limit = FORGOT_PASSWORD_LIMIT;
        } else {
            group = "general";
            limit = GENERAL_LIMIT;
        }

        String key = clientIp + ":" + group;

        // Eski girişleri temizle (bellek sızıntısı önleme)
        cleanupExpiredEntries();

        RateLimitEntry entry = requestCounts.computeIfAbsent(key, k -> new RateLimitEntry());

        // Pencere süresi dolmuşsa sıfırla
        long now = System.currentTimeMillis();
        if (now - entry.windowStart > WINDOW_MS) {
            entry.reset(now);
        }

        int currentCount = entry.count.incrementAndGet();

        if (currentCount > limit) {
            log.warn("Rate limit aşıldı: IP={}, group={}, count={}", clientIp, group, currentCount);
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.setHeader("Retry-After", "60");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.\",\"data\":null}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * İstemci IP adresini alır.
     *
     * GÜVENLİK: X-Forwarded-For header'ı istemci tarafından kolayca
     * sahtelendirilebilir. Bu nedenle doğrudan remoteAddr kullanılır.
     * Eğer güvenilir bir reverse proxy (Nginx, HAProxy) arkasındaysanız
     * ve proxy'nin X-Forwarded-For'u doğru şekilde ayarladığından
     * eminseniz, aşağıdaki yorum satırını açabilirsiniz.
     */
    private String getClientIp(HttpServletRequest request) {
        // Reverse proxy arkasındaysanız bu bloğu aktif edin:
        // String forwarded = request.getHeader("X-Forwarded-For");
        // if (forwarded != null && !forwarded.isBlank()) {
        //     return forwarded.split(",")[0].trim();
        // }
        return request.getRemoteAddr();
    }

    /**
     * Süresi dolmuş girişleri temizle — bellek sızıntısını önler.
     * Her 1000 istekte bir çalışır (performans için).
     */
    private void cleanupExpiredEntries() {
        if (requestCounts.size() > 1000) {
            long now = System.currentTimeMillis();
            requestCounts.entrySet().removeIf(e ->
                    now - e.getValue().windowStart > WINDOW_MS * 5);
        }
    }

    /** Tek bir IP+group için istek sayacı (thread-safe) */
    private static class RateLimitEntry {
        volatile long windowStart = System.currentTimeMillis();
        final AtomicInteger count = new AtomicInteger(0);

        /**
         * Pencereyi sıfırlar. synchronized ile race condition önlenir —
         * iki thread aynı anda reset çağırırsa sadece biri çalışır.
         */
        synchronized void reset(long now) {
            // Double-check: başka bir thread zaten sıfırlamış olabilir
            if (now - this.windowStart > WINDOW_MS) {
                this.windowStart = now;
                this.count.set(0);
            }
        }
    }
}
