package com.yeditepe.kampuskayipesya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig — Spring Security yapılandırması.
 *
 * Güvenlik katmanları:
 * 1. CORS — izin verilen origin'ler (geliştirme: localhost portları)
 * 2. JWT filtresi — token doğrulama ve kullanıcı tanıma
 * 3. Endpoint yetkilendirme — public / STUDENT / ADMIN ayrımı
 * 4. Stateless session — her istek kendi token'ını taşır
 *
 * Rol bazlı erişim:
 * - Public: login, register, eşya listeleme (GET), dosya görüntüleme
 * - STUDENT + ADMIN: bildirim, profil, kayıp bildirisi, teslim talebi
 * - Sadece ADMIN: eşya oluşturma/güncelleme, bildiri inceleme, teslim,
 *   dashboard, admin kullanıcı yönetimi
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, RateLimitFilter rateLimitFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // --- Spring Security hata sayfalarını devre dışı bırak ---
                // Varsayılan /error endpoint'i sunucu bilgilerini sızdırabilir
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write(
                                    "{\"success\":false,\"message\":\"Kimlik doğrulama gerekli\",\"data\":null}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write(
                                    "{\"success\":false,\"message\":\"Bu işlem için yetkiniz yok\",\"data\":null}");
                        })
                )

                // --- Endpoint yetkilendirme kuralları ---
                .authorizeHttpRequests(auth -> auth

                        // ══════════ PUBLIC ══════════
                        .requestMatchers("/api/auth/register", "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/found-items", "/api/found-items/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll()

                        // ══════════ ADMIN ONLY ══════════
                        // Bulunan eşya oluşturma/güncelleme
                        .requestMatchers(HttpMethod.POST, "/api/found-items").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/found-items/**").hasRole("ADMIN")

                        // Kayıp bildirisi inceleme (onay/red/revizyon)
                        .requestMatchers(HttpMethod.PUT, "/api/lost-reports/*/review").hasRole("ADMIN")

                        // Teslim talebi inceleme (onay/red)
                        .requestMatchers(HttpMethod.PUT, "/api/claim-requests/*/review").hasRole("ADMIN")

                        // Teslim kaydı oluşturma
                        .requestMatchers(HttpMethod.POST, "/api/deliveries").hasRole("ADMIN")

                        // Dashboard istatistikleri
                        .requestMatchers("/api/dashboard/**").hasRole("ADMIN")

                        // Admin kullanıcı yönetimi
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ══════════ AUTHENTICATED (öğrenci + admin) ══════════
                        .anyRequest().authenticated()
                )

                // Rate limit filtresi en önce çalışır (aşırı istek engeli)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                // JWT filtresi rate limit'ten sonra çalışır
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // --- Spring Security varsayılan header'larını güçlendir ---
                .headers(headers -> headers
                        // Tarayıcıya içeriği farklı tipte yorumlatma (XSS koruması)
                        .contentTypeOptions(opt -> {})
                        // Sayfayı iframe'e yüklenmeye karşı koru (clickjacking)
                        .frameOptions(frame -> frame.deny())
                        // Cache kontrolü — hassas veriler cache'lenmez
                        .cacheControl(cache -> {})
                );

        return http.build();
    }

    /**
     * CORS ayarları.
     * Geliştirme ortamı için localhost portlarına izin verilir.
     * Production'da sadece gerçek domain eklenmelidir.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Geliştirme ortamı — bilinen portlar
        config.setAllowedOrigins(List.of(
                "http://localhost:8081",
                "http://localhost:19006",
                "http://localhost:19000",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Preflight cache süresi (1 saat)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /** BCrypt şifre encoder — register ve login'de kullanılır. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
