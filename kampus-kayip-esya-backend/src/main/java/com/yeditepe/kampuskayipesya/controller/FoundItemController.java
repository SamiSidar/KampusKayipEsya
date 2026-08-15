package com.yeditepe.kampuskayipesya.controller;

import com.yeditepe.kampuskayipesya.dto.ApiResponse;
import com.yeditepe.kampuskayipesya.dto.FoundItemRequest;
import com.yeditepe.kampuskayipesya.dto.FoundItemResponse;
import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import com.yeditepe.kampuskayipesya.enums.FoundItemStatus;
import com.yeditepe.kampuskayipesya.service.FoundItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FoundItemController — Bulunan eşya endpoint'leri.
 *
 * GET    /api/found-items            → Tüm eşyaları listeler (opsiyonel filtreler: status, category, search)
 * GET    /api/found-items/{id}       → Tekil eşya detayı
 * POST   /api/found-items            → Yeni eşya kaydı (admin)
 * PUT    /api/found-items/{id}       → Eşya güncelleme (admin)
 *
 * Listeleme herkes için açıktır. Oluşturma ve güncelleme admin yetkisi gerektirir.
 */
@RestController
@RequestMapping("/api/found-items")
public class FoundItemController {

    private final FoundItemService foundItemService;

    public FoundItemController(FoundItemService foundItemService) {
        this.foundItemService = foundItemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FoundItemResponse>>> getItems(
            @RequestParam(required = false) FoundItemStatus status,
            @RequestParam(required = false) FoundItemCategory category,
            @RequestParam(required = false) String search) {

        List<FoundItemResponse> items;

        if (search != null && !search.isBlank()) {
            items = foundItemService.searchItems(search);
        } else if (status != null) {
            items = foundItemService.getItemsByStatus(status);
        } else if (category != null) {
            items = foundItemService.getItemsByCategory(category);
        } else {
            items = foundItemService.getAllItems();
        }

        return ResponseEntity.ok(ApiResponse.success("Bulunan eşyalar listelendi", items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoundItemResponse>> getItemById(@PathVariable Long id) {
        FoundItemResponse item = foundItemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success("Eşya detayı", item));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FoundItemResponse>> createItem(
            @Valid @RequestBody FoundItemRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        FoundItemResponse item = foundItemService.createItem(request, userId);
        return new ResponseEntity<>(
                ApiResponse.success("Eşya kaydedildi", item),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FoundItemResponse>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody FoundItemRequest request) {
        FoundItemResponse item = foundItemService.updateItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Eşya güncellendi", item));
    }
}
