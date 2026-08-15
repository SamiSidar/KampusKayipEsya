package com.yeditepe.kampuskayipesya.controller;

import com.yeditepe.kampuskayipesya.dto.ApiResponse;
import com.yeditepe.kampuskayipesya.dto.RegisterRequest;
import com.yeditepe.kampuskayipesya.dto.UserResponse;
import com.yeditepe.kampuskayipesya.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AdminUserController — Admin kullanıcı yönetimi.
 *
 * POST /api/admin/users → Mevcut admin yeni admin kullanıcı oluşturur
 *
 * Bu endpoint JWT gerektirir ve sadece ADMIN rolüne sahip
 * kullanıcılar tarafından çağrılabilir.
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AuthService authService;

    public AdminUserController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createAdmin(
            @Valid @RequestBody RegisterRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        UserResponse admin = authService.createAdmin(request, userId);
        return new ResponseEntity<>(
                ApiResponse.success("Admin kullanıcı oluşturuldu", admin),
                HttpStatus.CREATED);
    }
}
