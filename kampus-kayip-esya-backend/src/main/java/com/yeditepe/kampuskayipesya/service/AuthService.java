package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.*;
import com.yeditepe.kampuskayipesya.entity.PasswordResetToken;
import com.yeditepe.kampuskayipesya.entity.RefreshToken;
import com.yeditepe.kampuskayipesya.entity.User;
import com.yeditepe.kampuskayipesya.enums.UserRole;
import com.yeditepe.kampuskayipesya.exception.BadRequestException;
import com.yeditepe.kampuskayipesya.exception.DuplicateResourceException;
import com.yeditepe.kampuskayipesya.exception.ResourceNotFoundException;
import com.yeditepe.kampuskayipesya.exception.UnauthorizedException;
import com.yeditepe.kampuskayipesya.repository.PasswordResetTokenRepository;
import com.yeditepe.kampuskayipesya.repository.RefreshTokenRepository;
import com.yeditepe.kampuskayipesya.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * AuthService — Kimlik doğrulama servisi.
 *
 * Ne yapar:
 * - Yeni öğrenci kaydı oluşturur (register)
 * - Email + şifre ile giriş yapar ve JWT token döner (login)
 * - Token'dan kullanıcı bilgisi çeker (getAuthenticatedUser)
 *
 * Neden gerekli:
 * Frontend'den gelen login/register isteklerini karşılar.
 * Şifreler BCrypt ile hash'lenir, asla düz metin saklanmaz.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final DtoMapper dtoMapper;

    /** Reset token geçerlilik süresi (dakika) */
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 15;

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository resetTokenRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       DtoMapper dtoMapper) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.dtoMapper = dtoMapper;
    }

    /** İzin verilen email domainleri */
    private static final List<String> ALLOWED_DOMAINS = List.of(
            "@std.yeditepe.edu.tr",
            "@yeditepe.edu.tr"
    );

    /**
     * Yeni öğrenci kaydı oluşturur.
     * - Sadece STUDENT rolü oluşturulur (admin kayıt olamaz)
     * - Email @std.yeditepe.edu.tr veya @yeditepe.edu.tr olmalı
     * - Username email'den otomatik oluşturulur
     * - Ad ve soyad email'deki isimle uyumlu olmalı
     */
    public AuthResponse register(RegisterRequest request) {
        // Email domain kontrolü
        String email = request.getEmail().trim().toLowerCase();
        boolean validDomain = ALLOWED_DOMAINS.stream().anyMatch(email::endsWith);
        if (!validDomain) {
            throw new BadRequestException(
                    "Sadece @std.yeditepe.edu.tr veya @yeditepe.edu.tr uzantılı email adresleri ile kayıt olunabilir");
        }

        // Email'deki isimle ad-soyad uyumu kontrolü
        String emailPrefix = email.split("@")[0]; // örn: "ahmet.yilmaz"
        String firstName = request.getFirstName().trim().toLowerCase();
        String lastName = request.getLastName().trim().toLowerCase();

        // Email prefix'i ad veya soyadın en az birini içermeli
        // Türkçe karakter normalizasyonu tüm değerlere uygulanır
        String normalizedPrefix = normalizeTurkish(
                emailPrefix.replace(".", "").replace("_", "").replace("-", ""));
        String normalizedFirst = normalizeTurkish(firstName.replace(" ", ""));
        String normalizedLast = normalizeTurkish(lastName.replace(" ", ""));

        boolean nameMatch = normalizedPrefix.contains(normalizedFirst)
                || normalizedPrefix.contains(normalizedLast);
        if (!nameMatch) {
            throw new BadRequestException(
                    "Ad veya soyad, email adresinizdeki isimle uyuşmalıdır");
        }

        // Tekrar kontrolü
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Kullanıcı", "email", email);
        }

        // Öğrenci numarası zorunlu
        if (request.getStudentNumber() == null || request.getStudentNumber().isBlank()) {
            throw new BadRequestException("Öğrenci numarası boş olamaz");
        }
        if (userRepository.existsByStudentNumber(request.getStudentNumber())) {
            throw new DuplicateResourceException("Kullanıcı", "studentNumber", request.getStudentNumber());
        }

        // Username'i email'den otomatik oluştur (@ öncesi)
        String username = emailPrefix;
        if (userRepository.existsByUsername(username)) {
            // Çakışma varsa sonuna numara ekle
            int counter = 1;
            while (userRepository.existsByUsername(username + counter)) {
                counter++;
            }
            username = username + counter;
        }

        // fullName = firstName + lastName
        String fullName = request.getFirstName().trim() + " " + request.getLastName().trim();

        // Yeni kullanıcı oluştur — her zaman STUDENT
        User user = new User();
        user.setUsername(username);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.STUDENT);
        user.setStudentNumber(request.getStudentNumber());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDepartment(request.getDepartment());

        User savedUser = userRepository.save(user);

        // Access + refresh token üret
        String accessToken = jwtService.generateAccessToken(savedUser);
        String refreshTokenValue = createRefreshToken(savedUser);
        return new AuthResponse(accessToken, refreshTokenValue, dtoMapper.toUserResponse(savedUser));
    }

    /**
     * Admin tarafından yeni admin kullanıcısı oluşturur.
     * Sadece mevcut adminler bu metodu çağırabilir.
     */
    public UserResponse createAdmin(RegisterRequest request, Long adminUserId) {
        // Çağıran kullanıcının admin olduğunu kontrol et
        User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new UnauthorizedException("Kullanıcı bulunamadı"));
        if (adminUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Bu işlem için admin yetkisi gereklidir");
        }

        // Email domain kontrolü
        String email = request.getEmail().trim().toLowerCase();
        boolean validDomain = ALLOWED_DOMAINS.stream().anyMatch(email::endsWith);
        if (!validDomain) {
            throw new BadRequestException(
                    "Sadece @std.yeditepe.edu.tr veya @yeditepe.edu.tr uzantılı email adresleri kullanılabilir");
        }

        // Tekrar kontrolü
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Kullanıcı", "email", email);
        }

        // Username'i email'den otomatik oluştur
        String emailPrefix = email.split("@")[0];
        String username = emailPrefix;
        if (userRepository.existsByUsername(username)) {
            int counter = 1;
            while (userRepository.existsByUsername(username + counter)) {
                counter++;
            }
            username = username + counter;
        }

        String fullName = request.getFirstName().trim() + " " + request.getLastName().trim();

        User user = new User();
        user.setUsername(username);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.ADMIN);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDepartment(request.getDepartment());

        User savedUser = userRepository.save(user);
        return dtoMapper.toUserResponse(savedUser);
    }

    /**
     * Email ve şifre ile giriş yapar.
     * Başarılıysa JWT token + kullanıcı bilgisi döner.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email veya şifre hatalı"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Email veya şifre hatalı");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = createRefreshToken(user);
        return new AuthResponse(accessToken, refreshTokenValue, dtoMapper.toUserResponse(user));
    }

    /**
     * Token'daki userId'den kullanıcıyı bulup döner.
     * /auth/me endpoint'i için kullanılır.
     */
    public UserResponse getAuthenticatedUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Kullanıcı bulunamadı"));
        return dtoMapper.toUserResponse(user);
    }

    // ══════════════════════════════════════════════════════════
    // ŞİFREMİ UNUTTUM
    // ══════════════════════════════════════════════════════════

    /**
     * Şifre sıfırlama token'ı üretir.
     * Email kayıtlı değilse bile aynı mesaj döner (kullanıcı keşfini engeller).
     * Token 15 dakika geçerlidir.
     *
     * NOT: Gerçek production'da bu token email ile gönderilir.
     * Şu an geliştirme amaçlı response'ta döndürülür.
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Güvenlik: email var mı yok mu belli etme
            log.info("Şifre sıfırlama istendi ama email bulunamadı: {}", email);
            return null; // Controller aynı mesajı döner
        }

        // Mevcut token'ları sil
        resetTokenRepository.deleteByUserId(user.getId());

        // Yeni token oluştur
        String tokenValue = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenValue);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));
        resetTokenRepository.save(resetToken);

        log.info("Şifre sıfırlama token'ı oluşturuldu: userId={}", user.getId());

        // Geliştirme ortamı: token'ı döndür
        // Production'da burada email gönderme servisi çağrılır
        return tokenValue;
    }

    /**
     * Reset token ile şifreyi sıfırlar.
     * Token geçersiz veya süresi dolmuşsa hata fırlatır.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Geçersiz veya süresi dolmuş token"));

        if (resetToken.isExpired()) {
            resetTokenRepository.delete(resetToken);
            throw new BadRequestException("Token süresi dolmuş. Lütfen yeni bir sıfırlama isteği gönderin");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Kullanılan token'ı sil
        resetTokenRepository.delete(resetToken);

        log.info("Şifre başarıyla sıfırlandı: userId={}", user.getId());
    }

    // ══════════════════════════════════════════════════════════
    // PROFİL GÜNCELLEME
    // ══════════════════════════════════════════════════════════

    /**
     * Kullanıcı profilini günceller.
     * Sadece gönderilen (null olmayan) alanlar güncellenir.
     */
    public UserResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", "id", userId));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }

        User saved = userRepository.save(user);
        return dtoMapper.toUserResponse(saved);
    }

    /**
     * Kullanıcı şifresini değiştirir.
     * Mevcut şifre doğru girilmelidir.
     */
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mevcut şifre hatalı");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("Yeni şifre mevcut şifreyle aynı olamaz");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Şifre değiştirildi: userId={}", userId);
    }

    // ══════════════════════════════════════════════════════════
    // REFRESH TOKEN ROTATION
    // ══════════════════════════════════════════════════════════

    /**
     * Yeni refresh token oluşturur ve veritabanına kaydeder.
     * Her token bir "family" UUID'sine aittir — replay detection için kullanılır.
     */
    private String createRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        String family = UUID.randomUUID().toString();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenValue);
        refreshToken.setUser(user);
        refreshToken.setFamily(family);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(jwtService.getRefreshTokenExpirationMs() / 1000));
        refreshTokenRepository.save(refreshToken);

        return tokenValue;
    }

    /**
     * Refresh token ile yeni access + refresh token çifti üretir.
     * Eski refresh token rotate edilir (silinir, yeni üretilir).
     *
     * Güvenlik: Eğer kullanılmış (revoked) bir token tekrar kullanılırsa,
     * bu token ailesindeki TÜM token'lar silinir (replay attack koruması).
     */
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Geçersiz refresh token"));

        // Replay attack kontrolü — revoked token tekrar kullanıldıysa tüm aileyi sil
        if (existingToken.isRevoked()) {
            log.warn("Revoked refresh token kullanıldı! Family siliniyor: {}", existingToken.getFamily());
            refreshTokenRepository.deleteByFamily(existingToken.getFamily());
            throw new UnauthorizedException("Güvenlik ihlali tespit edildi, lütfen tekrar giriş yapın");
        }

        // Süre kontrolü
        if (existingToken.isExpired()) {
            refreshTokenRepository.delete(existingToken);
            throw new UnauthorizedException("Refresh token süresi dolmuş, lütfen tekrar giriş yapın");
        }

        User user = existingToken.getUser();
        String family = existingToken.getFamily();

        // Eski token'ı revoke et (silinmez, replay detection için kalır)
        existingToken.setRevoked(true);
        refreshTokenRepository.save(existingToken);

        // Yeni refresh token üret (aynı family)
        String newRefreshTokenValue = UUID.randomUUID().toString();
        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken(newRefreshTokenValue);
        newRefreshToken.setUser(user);
        newRefreshToken.setFamily(family);
        newRefreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(jwtService.getRefreshTokenExpirationMs() / 1000));
        refreshTokenRepository.save(newRefreshToken);

        // Yeni access token üret
        String newAccessToken = jwtService.generateAccessToken(user);

        log.info("Token rotated: userId={}", user.getId());
        return new AuthResponse(newAccessToken, newRefreshTokenValue, dtoMapper.toUserResponse(user));
    }

    /**
     * Kullanıcının tüm refresh token'larını siler (logout).
     */
    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
        log.info("Kullanıcı çıkış yaptı: userId={}", userId);
    }

    /**
     * Türkçe karakterleri ASCII karşılıklarına dönüştürür.
     * Email-ad eşleştirmesinde tutarlılık sağlar.
     */
    private String normalizeTurkish(String input) {
        return input.replace("ı", "i").replace("İ", "I")
                .replace("ö", "o").replace("Ö", "O")
                .replace("ü", "u").replace("Ü", "U")
                .replace("ş", "s").replace("Ş", "S")
                .replace("ç", "c").replace("Ç", "C")
                .replace("ğ", "g").replace("Ğ", "G")
                .toLowerCase();
    }
}
