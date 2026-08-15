package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.DeliveryRequest;
import com.yeditepe.kampuskayipesya.dto.DeliveryResponse;
import com.yeditepe.kampuskayipesya.entity.*;
import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import com.yeditepe.kampuskayipesya.enums.FoundItemStatus;
import com.yeditepe.kampuskayipesya.exception.BadRequestException;
import com.yeditepe.kampuskayipesya.exception.ResourceNotFoundException;
import com.yeditepe.kampuskayipesya.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DeliveryService — Teslim servisi.
 *
 * Ne yapar:
 * - Admin bir eşyayı sahibine teslim ettiğinde kayıt oluşturur
 * - Teslim listesini ve detaylarını getirir
 * - Teslim sırasında eşyanın statüsünü DELIVERED yapar
 * - İlgili teslim talebini COMPLETED yapar
 * - Öğrenciye teslim bildirimi gönderir
 *
 * Neden gerekli:
 * Eşyanın fiziksel tesliminin kayıt altına alınması, kimin kime
 * ne zaman teslim ettiğinin izlenebilir olmasını sağlar.
 */
@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final FoundItemRepository foundItemRepository;
    private final ClaimRequestRepository claimRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DtoMapper dtoMapper;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           FoundItemRepository foundItemRepository,
                           ClaimRequestRepository claimRequestRepository,
                           UserRepository userRepository,
                           NotificationService notificationService,
                           DtoMapper dtoMapper) {
        this.deliveryRepository = deliveryRepository;
        this.foundItemRepository = foundItemRepository;
        this.claimRequestRepository = claimRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.dtoMapper = dtoMapper;
    }

    /** Tüm teslim kayıtlarını yeniden eskiye listeler. */
    public List<DeliveryResponse> getAllDeliveries() {
        return deliveryRepository.findAllByOrderByDeliveredAtDesc()
                .stream()
                .map(dtoMapper::toDeliveryResponse)
                .collect(Collectors.toList());
    }

    /** Tekil teslim detayı. */
    public DeliveryResponse getDeliveryById(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Teslim kaydı", "id", deliveryId));
        return dtoMapper.toDeliveryResponse(delivery);
    }

    /**
     * Eşya teslim kaydı oluşturur.
     * Eşya zaten teslim edilmişse hata verir.
     * Teslim talebi varsa onu da COMPLETED yapar.
     */
    @Transactional
    public DeliveryResponse createDelivery(DeliveryRequest request, Long adminUserId) {
        // Eşya kontrolü
        FoundItem item = foundItemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Bulunan eşya", "id", request.getItemId()));

        if (item.getStatus() == FoundItemStatus.DELIVERED) {
            throw new BadRequestException("Bu eşya zaten teslim edilmiş");
        }

        if (deliveryRepository.existsByItemId(request.getItemId())) {
            throw new BadRequestException("Bu eşya için zaten bir teslim kaydı var");
        }

        // Admin kullanıcısı
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", "id", adminUserId));

        // Teslim kaydı oluştur
        Delivery delivery = new Delivery();
        delivery.setItem(item);
        delivery.setDeliveredToName(request.getDeliveredToName());
        delivery.setDeliveredToStudentNumber(request.getDeliveredToStudentNumber());
        delivery.setDeliveredBy(admin);
        delivery.setDeliveredAt(LocalDateTime.now());
        delivery.setAdminNote(request.getAdminNote());

        // Teslim talebi varsa bağla ve tamamla
        User studentToNotify = null;
        if (request.getClaimId() != null) {
            ClaimRequest claim = claimRequestRepository.findById(request.getClaimId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teslim talebi", "id", request.getClaimId()));
            delivery.setClaim(claim);
            claim.setStatus(ClaimRequestStatus.COMPLETED);
            claimRequestRepository.save(claim);
            studentToNotify = claim.getStudent();
        }

        // Eşyanın statüsünü DELIVERED yap
        item.setStatus(FoundItemStatus.DELIVERED);
        item.setDeliveredAt(LocalDateTime.now());
        foundItemRepository.save(item);

        Delivery saved = deliveryRepository.save(delivery);

        // Öğrenciye bildirim gönder
        if (studentToNotify != null) {
            notificationService.sendDeliveryNotification(saved, studentToNotify);
        }

        return dtoMapper.toDeliveryResponse(saved);
    }
}
