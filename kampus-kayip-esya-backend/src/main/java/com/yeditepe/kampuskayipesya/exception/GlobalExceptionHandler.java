package com.yeditepe.kampuskayipesya.exception;

import com.yeditepe.kampuskayipesya.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler — Tüm hataları yakalar ve güvenli mesaj döner.
 *
 * Güvenlik kuralı: Frontend'e ASLA iç detay gönderilmez.
 * - SQL hata mesajları → "İşlem sırasında bir hata oluştu"
 * - Stack trace → sadece sunucu loglarına
 * - Sınıf/paket adları → gizli
 * - Dosya yolları → gizli
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ══════════ Bilinen iş mantığı hataları (mesaj güvenli) ══════════

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(ApiResponse.error(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return new ResponseEntity<>(ApiResponse.error(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResource(DuplicateResourceException ex) {
        return new ResponseEntity<>(ApiResponse.error(ex.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return new ResponseEntity<>(ApiResponse.error(ex.getMessage()), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(ForbiddenException ex) {
        return new ResponseEntity<>(ApiResponse.error(ex.getMessage()), HttpStatus.FORBIDDEN);
    }

    // ══════════ Spring Security erişim engeli ══════════

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("Bu işlem için yetkiniz yok"),
                HttpStatus.FORBIDDEN);
    }

    // ══════════ Validasyon hataları (alan bazlı) ══════════

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return new ResponseEntity<>(
                new ApiResponse<>(false, "Validasyon hatası", errors),
                HttpStatus.BAD_REQUEST);
    }

    // ══════════ Bozuk JSON body ══════════

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadJson(HttpMessageNotReadableException ex) {
        log.warn("Bozuk JSON gövdesi: {}", ex.getMessage());
        return new ResponseEntity<>(
                ApiResponse.error("Geçersiz istek formatı"),
                HttpStatus.BAD_REQUEST);
    }

    // ══════════ Eksik header (X-User-Id vb.) ══════════

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingHeader(MissingRequestHeaderException ex) {
        log.warn("Eksik header: {}", ex.getHeaderName());
        return new ResponseEntity<>(
                ApiResponse.error("Kimlik doğrulama gerekli"),
                HttpStatus.UNAUTHORIZED);
    }

    // ══════════ Desteklenmeyen HTTP metodu ══════════

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("Bu işlem desteklenmiyor"),
                HttpStatus.METHOD_NOT_ALLOWED);
    }

    // ══════════ Veritabanı bütünlük hatası (unique constraint vb.) ══════════

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        // SQL hata detayını ASLA frontend'e gönderme
        log.error("Veritabanı bütünlük hatası: {}", ex.getMessage());
        return new ResponseEntity<>(
                ApiResponse.error("Bu işlem mevcut verilerle çakışıyor"),
                HttpStatus.CONFLICT);
    }

    // ══════════ Bilinmeyen endpoint ══════════

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("İstenen kaynak bulunamadı"),
                HttpStatus.NOT_FOUND);
    }

    // ══════════ Diğer tüm hatalar — İÇ DETAY SIZDIRMAZ ══════════

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        // Detaylar sadece sunucu loglarında — frontend'e genel mesaj
        log.error("Beklenmeyen hata: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(
                ApiResponse.error("İşlem sırasında bir hata oluştu"),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}