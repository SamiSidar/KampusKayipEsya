package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.ClaimRequestCreateDTO;
import com.yeditepe.kampuskayipesya.dto.ClaimRequestResponse;
import com.yeditepe.kampuskayipesya.dto.ClaimReviewRequest;
import com.yeditepe.kampuskayipesya.entity.ClaimRequest;
import com.yeditepe.kampuskayipesya.entity.FoundItem;
import com.yeditepe.kampuskayipesya.entity.User;
import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import com.yeditepe.kampuskayipesya.enums.FoundItemStatus;
import com.yeditepe.kampuskayipesya.exception.BadRequestException;
import com.yeditepe.kampuskayipesya.exception.DuplicateResourceException;
import com.yeditepe.kampuskayipesya.exception.ResourceNotFoundException;
import com.yeditepe.kampuskayipesya.repository.ClaimRequestRepository;
import com.yeditepe.kampuskayipesya.repository.FoundItemRepository;
import com.yeditepe.kampuskayipesya.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ClaimRequestService — Teslim talebi servisi.
 *
 * Ne yapar:
 * - Öğrenci bir bulunan eşya için teslim talebi oluşturur
 * - Öğrenci kendi taleplerini görür
 * - Admin tüm talepleri listeler
 * - Admin bir talebi onaylar, reddeder veya ek bilgi ister
 *
 * Neden gerekli:
 * Bir öğrenci bulunan eşyalar listesinde kendi eşyasını gördüğünde
 * "bu benim" diyerek teslim talebi oluşturur. Admin eşyayı tanımlayan
 * bilgileri kontrol edip talebi onaylar veya reddeder.
 */
@Service
public class ClaimRequestService {

    private final ClaimRequestRepository claimRequestRepository;
    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DtoMapper dtoMapper;

    public ClaimRequestService(ClaimRequestRepository claimRequestRepository,
                               FoundItemRepository foundItemRepository,
                               UserRepository userRepository,
                               NotificationService notificationService,
                               DtoMapper dtoMapper) {
        this.claimRequestRepository = claimRequestRepository;
        this.foundItemRepository = foundItemRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.dtoMapper = dtoMapper;
    }

    /** Tüm talepleri listeler (admin için). */
    public List<ClaimRequestResponse> getAllClaims() {
        return claimRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(dtoMapper::toClaimRequestResponse)
                .collect(Collectors.toList());
    }

    /** Belirli statüdeki talepleri getirir. */
    public List<ClaimRequestResponse> getClaimsByStatus(ClaimRequestStatus status) {
        return claimRequestRepository.findByStatus(status)
                .stream()
                .map(dtoMapper::toClaimRequestResponse)
                .collect(Collectors.toList());
    }

    /** Belirli bir eşyaya ait talepleri getirir. */
    public List<ClaimRequestResponse> getClaimsByItem(Long itemId) {
        return claimRequestRepository.findByItemId(itemId)
                .stream()
                .map(dtoMapper::toClaimRequestResponse)
                .collect(Collectors.toList());
    }

    /** Öğrencinin kendi taleplerini getirir. */
    public List<ClaimRequestResponse> getClaimsByStudent(Long studentId) {
        return claimRequestRepository.findByStudentId(studentId)
                .stream()
                .map(dtoMapper::toClaimRequestResponse)
                .collect(Collectors.toList());
    }

    /** Tekil talep detayı. */
    public ClaimRequestResponse getClaimById(Long claimId) {
        ClaimRequest claim = claimRequestRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Teslim talebi", "id", claimId));
        return dtoMapper.toClaimRequestResponse(claim);
    }

    /**
     * Öğrenci teslim talebi oluşturur.
     * Aynı eşyaya aynı öğrenci birden fazla talep gönderemez.
     * Eşyanın WAITING_OWNER veya CLAIM_REQUESTED statüsünde olması gerekir.
     */
    @Transactional
    public ClaimRequestResponse createClaim(ClaimRequestCreateDTO request, Long studentId) {
        FoundItem item = foundItemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Bulunan eşya", "id", request.getItemId()));

        // Eşya teslim edilebilir durumda mı?
        if (item.getStatus() != FoundItemStatus.WAITING_OWNER
                && item.getStatus() != FoundItemStatus.CLAIM_REQUESTED) {
            throw new BadRequestException("Bu eşya için talep oluşturulamaz");
        }

        // Aynı öğrenci aynı eşyaya tekrar talep gönderemez
        if (claimRequestRepository.existsByItemIdAndStudentId(request.getItemId(), studentId)) {
            throw new DuplicateResourceException("Teslim talebi", "itemId+studentId",
                    request.getItemId() + "+" + studentId);
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", "id", studentId));

        ClaimRequest claim = new ClaimRequest();
        claim.setItem(item);
        claim.setStudent(student);
        claim.setDescription(request.getDescription());
        claim.setDistinguishingFeature(request.getDistinguishingFeature());
        claim.setAdditionalNote(request.getAdditionalNote());
        // status @PrePersist ile PENDING olarak atanır

        // Eşyanın statüsünü CLAIM_REQUESTED yap
        item.setStatus(FoundItemStatus.CLAIM_REQUESTED);
        foundItemRepository.save(item);

        ClaimRequest saved = claimRequestRepository.save(claim);
        return dtoMapper.toClaimRequestResponse(saved);
    }

    /**
     * Admin teslim talebini inceler: onaylar, reddeder veya ek bilgi ister.
     * Onaylanırsa öğrenciye bildirim gider.
     */
    @Transactional
    public ClaimRequestResponse reviewClaim(Long claimId, ClaimReviewRequest request) {
        ClaimRequest claim = claimRequestRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Teslim talebi", "id", claimId));

        // Durum geçişi kontrolü — geçersiz geçişleri engelle
        if (!claim.getStatus().canTransitionTo(request.getStatus())) {
            throw new BadRequestException(
                    "'" + claim.getStatus() + "' durumundaki talep '" + request.getStatus() + "' durumuna geçirilemez");
        }

        claim.setStatus(request.getStatus());
        claim.setAdminNote(request.getAdminNote());
        claim.setReviewedAt(LocalDateTime.now());

        ClaimRequest saved = claimRequestRepository.save(claim);

        // Öğrenciye bildirim gönder
        notificationService.sendClaimNotification(saved);

        return dtoMapper.toClaimRequestResponse(saved);
    }
}
