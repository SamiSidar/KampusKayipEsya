package com.yeditepe.kampuskayipesya.controller;

import com.yeditepe.kampuskayipesya.dto.ApiResponse;
import com.yeditepe.kampuskayipesya.dto.ClaimRequestCreateDTO;
import com.yeditepe.kampuskayipesya.dto.ClaimRequestResponse;
import com.yeditepe.kampuskayipesya.dto.ClaimReviewRequest;
import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import com.yeditepe.kampuskayipesya.service.ClaimRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ClaimRequestController — Teslim talebi endpoint'leri.
 *
 * GET    /api/claim-requests             → Tüm talepleri listeler (filtre: status, itemId)
 * GET    /api/claim-requests/my          → Öğrencinin kendi talepleri
 * GET    /api/claim-requests/{id}        → Tekil talep detayı
 * POST   /api/claim-requests             → Yeni teslim talebi (öğrenci)
 * PUT    /api/claim-requests/{id}/review → Admin incelemesi (onayla/reddet/ek bilgi iste)
 */
@RestController
@RequestMapping("/api/claim-requests")
public class ClaimRequestController {

    private final ClaimRequestService claimRequestService;

    public ClaimRequestController(ClaimRequestService claimRequestService) {
        this.claimRequestService = claimRequestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClaimRequestResponse>>> getClaims(
            @RequestParam(required = false) ClaimRequestStatus status,
            @RequestParam(required = false) Long itemId) {

        List<ClaimRequestResponse> claims;

        if (itemId != null) {
            claims = claimRequestService.getClaimsByItem(itemId);
        } else if (status != null) {
            claims = claimRequestService.getClaimsByStatus(status);
        } else {
            claims = claimRequestService.getAllClaims();
        }

        return ResponseEntity.ok(ApiResponse.success("Teslim talepleri listelendi", claims));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ClaimRequestResponse>>> getMyClaims(
            @RequestHeader("X-User-Id") Long userId) {
        List<ClaimRequestResponse> claims = claimRequestService.getClaimsByStudent(userId);
        return ResponseEntity.ok(ApiResponse.success("Talepleriniz listelendi", claims));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClaimRequestResponse>> getClaimById(@PathVariable Long id) {
        ClaimRequestResponse claim = claimRequestService.getClaimById(id);
        return ResponseEntity.ok(ApiResponse.success("Talep detayı", claim));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimRequestResponse>> createClaim(
            @Valid @RequestBody ClaimRequestCreateDTO request,
            @RequestHeader("X-User-Id") Long userId) {
        ClaimRequestResponse claim = claimRequestService.createClaim(request, userId);
        return new ResponseEntity<>(
                ApiResponse.success("Teslim talebi oluşturuldu", claim),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<ClaimRequestResponse>> reviewClaim(
            @PathVariable Long id,
            @Valid @RequestBody ClaimReviewRequest request) {
        ClaimRequestResponse claim = claimRequestService.reviewClaim(id, request);
        return ResponseEntity.ok(ApiResponse.success("Talep incelendi", claim));
    }
}
