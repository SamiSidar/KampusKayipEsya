package com.yeditepe.kampuskayipesya.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * ForgotPasswordRequest — Şifremi unuttum isteği.
 * Kullanıcı email adresini girer, sistem reset token üretir.
 */
public class ForgotPasswordRequest {

    @NotBlank(message = "Email boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    private String email;

    public ForgotPasswordRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
