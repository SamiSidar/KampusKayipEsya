package com.yeditepe.kampuskayipesya.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Kimlik doğrulanamadığında fırlatılır → HTTP 401.
 *
 * Örnek: hatalı e-posta/şifre, geçersiz token.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}