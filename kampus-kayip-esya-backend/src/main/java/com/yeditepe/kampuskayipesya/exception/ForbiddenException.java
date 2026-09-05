package com.yeditepe.kampuskayipesya.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Kullanıcı giriş yapmış ama bu işleme yetkisi yoksa fırlatılır → HTTP 403.
 *
 * Örnek: öğrencinin admin işlemi denemesi.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}