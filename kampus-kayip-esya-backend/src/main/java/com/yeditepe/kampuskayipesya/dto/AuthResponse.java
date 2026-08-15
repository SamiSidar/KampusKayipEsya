package com.yeditepe.kampuskayipesya.dto;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String token, String refreshToken, UserResponse user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    /** @deprecated Eski tek-token constructor. Yeni kod 3-parametreli constructor kullanmalı. */
    @Deprecated
    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
}
