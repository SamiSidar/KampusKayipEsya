package com.yeditepe.kampuskayipesya.controller;

import com.yeditepe.kampuskayipesya.dto.ApiResponse;
import com.yeditepe.kampuskayipesya.dto.DeliveryRequest;
import com.yeditepe.kampuskayipesya.dto.DeliveryResponse;
import com.yeditepe.kampuskayipesya.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * DeliveryController — Teslim kayıt endpoint'leri.
 * GET    /api/deliveries      → Tüm teslim kayıtlarını listeler
 * GET    /api/deliveries/{id} → Tekil teslim detayı
 * POST   /api/deliveries      → Yeni teslim kaydı oluşturur (admin)
 */
@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getDeliveries() {
        List<DeliveryResponse> deliveries = deliveryService.getAllDeliveries();
        return ResponseEntity.ok(ApiResponse.success("Teslim kayıtları listelendi", deliveries));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryById(@PathVariable Long id) {
        DeliveryResponse delivery = deliveryService.getDeliveryById(id);
        return ResponseEntity.ok(ApiResponse.success("Teslim detayı", delivery));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryResponse>> createDelivery(
            @Valid @RequestBody DeliveryRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        DeliveryResponse delivery = deliveryService.createDelivery(request, userId);
        return new ResponseEntity<>(
                ApiResponse.success("Teslim kaydedildi", delivery),
                HttpStatus.CREATED);
    }
}
