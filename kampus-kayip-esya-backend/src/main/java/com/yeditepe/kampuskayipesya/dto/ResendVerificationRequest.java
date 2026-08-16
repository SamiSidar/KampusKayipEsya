package com.yeditepe.kampuskayipesya.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ResendVerificationRequest {

    @NotBlank(message = "Email boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
