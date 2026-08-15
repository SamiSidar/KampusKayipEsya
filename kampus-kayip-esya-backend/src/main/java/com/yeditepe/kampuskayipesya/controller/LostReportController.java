package com.yeditepe.kampuskayipesya.controller;

import com.yeditepe.kampuskayipesya.dto.ApiResponse;
import com.yeditepe.kampuskayipesya.dto.LostReportRequest;
import com.yeditepe.kampuskayipesya.dto.LostReportResponse;
import com.yeditepe.kampuskayipesya.dto.ReportReviewRequest;
import com.yeditepe.kampuskayipesya.enums.LostReportStatus;
import com.yeditepe.kampuskayipesya.service.LostReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * LostReportController — Kayıp bildirisi endpoint'leri.
 *
 * GET    /api/lost-reports              → Tüm bildirileri listeler (filtre: status)
 * GET    /api/lost-reports/my           → Öğrencinin kendi bildirileri
 * GET    /api/lost-reports/{id}         → Tekil bildiri detayı
 * POST   /api/lost-reports              → Yeni kayıp bildirisi (öğrenci)
 * PUT    /api/lost-reports/{id}         → Bildiri güncelleme (öğrenci, sadece düzenleme istendiğinde)
 * PUT    /api/lost-reports/{id}/review  → Admin incelemesi (onayla/reddet/düzenleme iste/eşleştir)
 */
@RestController
@RequestMapping("/api/lost-reports")
public class LostReportController {

    private final LostReportService lostReportService;

    public LostReportController(LostReportService lostReportService) {
        this.lostReportService = lostReportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LostReportResponse>>> getReports(
            @RequestParam(required = false) LostReportStatus status) {

        List<LostReportResponse> reports;
        if (status != null) {
            reports = lostReportService.getReportsByStatus(status);
        } else {
            reports = lostReportService.getAllReports();
        }

        return ResponseEntity.ok(ApiResponse.success("Kayıp bildirileri listelendi", reports));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LostReportResponse>>> getMyReports(
            @RequestHeader("X-User-Id") Long userId) {
        List<LostReportResponse> reports = lostReportService.getReportsByStudent(userId);
        return ResponseEntity.ok(ApiResponse.success("Bildirileriniz listelendi", reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LostReportResponse>> getReportById(@PathVariable Long id) {
        LostReportResponse report = lostReportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.success("Bildiri detayı", report));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LostReportResponse>> createReport(
            @Valid @RequestBody LostReportRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        LostReportResponse report = lostReportService.createReport(request, userId);
        return new ResponseEntity<>(
                ApiResponse.success("Kayıp bildirisi oluşturuldu", report),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LostReportResponse>> updateReport(
            @PathVariable Long id,
            @Valid @RequestBody LostReportRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        LostReportResponse report = lostReportService.updateReport(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Bildiri güncellendi", report));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<LostReportResponse>> reviewReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportReviewRequest request) {
        LostReportResponse report = lostReportService.reviewReport(id, request);
        return ResponseEntity.ok(ApiResponse.success("Bildiri incelendi", report));
    }
}
