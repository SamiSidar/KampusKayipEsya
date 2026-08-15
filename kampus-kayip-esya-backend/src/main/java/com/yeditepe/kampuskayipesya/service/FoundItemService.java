package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.FoundItemRequest;
import com.yeditepe.kampuskayipesya.dto.FoundItemResponse;
import com.yeditepe.kampuskayipesya.entity.FoundItem;
import com.yeditepe.kampuskayipesya.entity.User;
import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import com.yeditepe.kampuskayipesya.enums.FoundItemStatus;
import com.yeditepe.kampuskayipesya.exception.BadRequestException;
import com.yeditepe.kampuskayipesya.exception.ResourceNotFoundException;
import com.yeditepe.kampuskayipesya.repository.FoundItemRepository;
import com.yeditepe.kampuskayipesya.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * FoundItemService — Bulunan eşya servisi.
 *
 * Ne yapar:
 * - Tüm bulunan eşyaları listeler (filtreleme destekli)
 * - Tekil eşya detayı getirir
 * - Admin yeni bulunan eşya kaydı oluşturur
 * - Eşya bilgilerini günceller
 *
 * Neden gerekli:
 * Admin güvenlik görevlisinin teslim aldığı eşyaları sisteme girmesini,
 * öğrencilerin de bu eşyaları listeleyip görmesini sağlar.
 */
@Service
public class FoundItemService {

    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    public FoundItemService(FoundItemRepository foundItemRepository,
                            UserRepository userRepository,
                            DtoMapper dtoMapper) {
        this.foundItemRepository = foundItemRepository;
        this.userRepository = userRepository;
        this.dtoMapper = dtoMapper;
    }

    /** Tüm bulunan eşyaları yeniden eskiye sıralı getirir. */
    public List<FoundItemResponse> getAllItems() {
        return foundItemRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(dtoMapper::toFoundItemResponse)
                .collect(Collectors.toList());
    }

    /** Belirli statüdeki eşyaları getirir (örn: WAITING_OWNER). */
    public List<FoundItemResponse> getItemsByStatus(FoundItemStatus status) {
        return foundItemRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(dtoMapper::toFoundItemResponse)
                .collect(Collectors.toList());
    }

    /** Kategoriye göre filtreler. */
    public List<FoundItemResponse> getItemsByCategory(FoundItemCategory category) {
        return foundItemRepository.findByCategory(category)
                .stream()
                .map(dtoMapper::toFoundItemResponse)
                .collect(Collectors.toList());
    }

    /** Başlıkta arama yapar (case-insensitive). */
    public List<FoundItemResponse> searchItems(String keyword) {
        return foundItemRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(dtoMapper::toFoundItemResponse)
                .collect(Collectors.toList());
    }

    /** ID ile tekil eşya detayı getirir. */
    public FoundItemResponse getItemById(Long itemId) {
        FoundItem item = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Bulunan eşya", "id", itemId));
        return dtoMapper.toFoundItemResponse(item);
    }

    /** Admin yeni bulunan eşya kaydı oluşturur. */
    public FoundItemResponse createItem(FoundItemRequest request, Long adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", "id", adminUserId));

        FoundItem item = new FoundItem();
        item.setTitle(request.getTitle());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setFoundDate(LocalDate.parse(request.getFoundDate()));
        item.setDescription(request.getDescription());
        item.setStorageLocation(request.getStorageLocation());
        item.setImageUrl(request.getImageUrl());
        item.setCreatedBy(admin);
        // status @PrePersist ile WAITING_OWNER olarak atanır

        FoundItem saved = foundItemRepository.save(item);
        return dtoMapper.toFoundItemResponse(saved);
    }

    /** Eşya bilgilerini günceller. Teslim edilmiş/arşivlenmiş eşya güncellenemez. */
    public FoundItemResponse updateItem(Long itemId, FoundItemRequest request) {
        FoundItem item = foundItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Bulunan eşya", "id", itemId));

        // Durum kontrolü — teslim edilmiş veya arşivlenmiş eşya güncellenemez
        if (!item.getStatus().isEditable()) {
            throw new BadRequestException(
                    "'" + item.getStatus() + "' durumundaki eşya güncellenemez");
        }

        item.setTitle(request.getTitle());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setFoundDate(LocalDate.parse(request.getFoundDate()));
        item.setDescription(request.getDescription());
        item.setStorageLocation(request.getStorageLocation());
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }

        FoundItem saved = foundItemRepository.save(item);
        return dtoMapper.toFoundItemResponse(saved);
    }
}
