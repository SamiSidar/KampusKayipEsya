package com.yeditepe.kampuskayipesya.config;

import com.yeditepe.kampuskayipesya.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

/**
 * JwtAuthFilter — JWT token doğrulama filtresi.
 *
 * Güvenlik önlemleri:
 * - Süresi dolmuş token → 401 + "Oturum süresi doldu" (iç detay verilmez)
 * - Geçersiz/bozuk token → 401 + "Geçersiz token" (iç detay verilmez)
 * - Frontend'den gelen X-User-Id/X-User-Role header'ları temizlenir
 *   (sadece token'dan çıkan değerler kullanılır)
 * - Hata detayları sadece sunucu loglarına yazılır
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Frontend'den gelen sahte header'ları her zaman temizle
        // (sadece token'dan çıkan değerler güvenilir)
        HeaderMapRequestWrapper wrappedRequest = new HeaderMapRequestWrapper(request);
        wrappedRequest.removeHeader("X-User-Id");
        wrappedRequest.removeHeader("X-User-Role");

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // Token'ı tek seferde parse et (performans: 3 ayrı parse yerine 1)
                var claims = jwtService.extractAllClaimsIfValid(token);
                if (claims != null) {
                    Long userId = claims.get("userId", Long.class);
                    String role = claims.get("role", String.class);

                    // Spring Security authentication
                    List<SimpleGrantedAuthority> authorities =
                            List.of(new SimpleGrantedAuthority("ROLE_" + role));
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Token'dan çıkan güvenli değerleri header olarak ekle
                    wrappedRequest.addHeader("X-User-Id", String.valueOf(userId));
                    wrappedRequest.addHeader("X-User-Role", role);
                }
                // Token geçersizse (süresi dolmuş değil ama valid değil)
                // sessizce geç — public endpoint'ler çalışsın
            } catch (ExpiredJwtException ex) {
                // Token süresi dolmuş — frontend'e temiz mesaj dön
                log.warn("Süresi dolmuş token kullanıldı: {}", request.getRequestURI());
                sendErrorResponse(response, 401, "Oturum süreniz doldu, lütfen tekrar giriş yapın");
                return;
            } catch (JwtException ex) {
                // Bozuk/geçersiz token — detayları logla, frontend'e genel mesaj dön
                log.warn("Geçersiz JWT token: {} - {}", request.getRequestURI(), ex.getMessage());
                sendErrorResponse(response, 401, "Geçersiz kimlik bilgisi");
                return;
            } catch (Exception ex) {
                // Beklenmeyen hata — detayları asla frontend'e verme
                log.error("JWT işleme hatası: {}", request.getRequestURI(), ex);
                sendErrorResponse(response, 401, "Kimlik doğrulama hatası");
                return;
            }
        }

        filterChain.doFilter(wrappedRequest, response);
    }

    /**
     * Frontend'e güvenli JSON hata mesajı gönderir.
     * İç detaylar (stack trace, sınıf adı, SQL mesajı vb.) asla gönderilmez.
     */
    private void sendErrorResponse(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                "{\"success\":false,\"message\":\"" + message + "\",\"data\":null}");
    }

    /**
     * HttpServletRequest'e custom header ekleyebilmek için wrapper.
     * Ayrıca frontend'den gelen sahte header'ları kaldırabilir.
     */
    private static class HeaderMapRequestWrapper extends HttpServletRequestWrapper {

        private final Map<String, String> customHeaders = new HashMap<>();
        private final Set<String> removedHeaders = new HashSet<>();

        public HeaderMapRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        public void addHeader(String name, String value) {
            removedHeaders.remove(name);
            customHeaders.put(name, value);
        }

        public void removeHeader(String name) {
            customHeaders.remove(name);
            removedHeaders.add(name);
        }

        @Override
        public String getHeader(String name) {
            if (removedHeaders.contains(name)) return null;
            String customValue = customHeaders.get(name);
            if (customValue != null) return customValue;
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            Set<String> names = new HashSet<>(Collections.list(super.getHeaderNames()));
            names.removeAll(removedHeaders);
            names.addAll(customHeaders.keySet());
            return Collections.enumeration(names);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (removedHeaders.contains(name)) return Collections.emptyEnumeration();
            if (customHeaders.containsKey(name)) {
                return Collections.enumeration(Collections.singletonList(customHeaders.get(name)));
            }
            return super.getHeaders(name);
        }
    }
}
