package com.yeditepe.kampuskayipesya.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * İstemci hatalı veri gönderdiğinde fırlatılır → HTTP 400.
 *
 * Örnek: geçersiz doğrulama kodu, süresi dolmuş kod.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}