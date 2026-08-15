package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.NotificationResponse;
import com.yeditepe.kampuskayipesya.entity.*;
import com.yeditepe.kampuskayipesya.enums.NotificationType;
import com.yeditepe.kampuskayipesya.exception.ResourceNotFoundException;
import com.yeditepe.kampuskayipesya.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * NotificationService — Bildirim servisi.
 *
 * Ne yapar:
 * - Kullanıcının bildirimlerini listeler
 * - Okunmamış bildirim sayısını döner
 * - Bildirimi okundu olarak işaretler
 * - Tüm bildirimleri okundu yapar
 * - Durum değişikliklerinde otomatik bildirim oluşturur
 *
 * Neden gerekli:
 * Öğrenci, bildirisi onaylandığında, eşya eşleştiğinde veya
 * teslim talebi sonuçlandığında uygulama içi bildirim alır.
 * Bu servis tüm bu bildirimleri merkezi olarak yönetir.
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DtoMapper dtoMapper;

    public NotificationService(NotificationRepository notificationRepository,
                               DtoMapper dtoMapper) {
        this.notificationRepository = notificationRepository;
        this.dtoMapper = dtoMapper;
    }

    /** Kullanıcının tüm bildirimlerini yeniden eskiye getirir. */
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(dtoMapper::toNotificationResponse)
                .collect(Collectors.toList());
    }

    /** Okunmamış bildirimleri getirir. */
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(dtoMapper::toNotificationResponse)
                .collect(Collectors.toList());
    }

    /** Okunmamış bildirim sayısını döner. */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /** Tek bir bildirimi okundu olarak işaretler. */
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Bildirim", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Bildirim", "id", notificationId);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /** Kullanıcının tüm bildirimlerini okundu yapar. */
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    // ==================== OTOMATİK BİLDİRİM GÖNDERİCİLER ====================

    /**
     * Kayıp bildirisi durum değişikliğinde öğrenciye bildirim gönderir.
     * Örn: onaylandı, reddedildi, düzenleme istendi, eşleşme bulundu.
     */
    public void sendReportNotification(LostReport report) {
        NotificationType type;
        String title;
        String description;

        switch (report.getStatus()) {
            case APPROVED:
                type = NotificationType.REPORT_APPROVED;
                title = "Bildiriniz Onaylandı";
                description = "\"" + report.getTitle() + "\" kayıp bildiriniz onaylandı.";
                break;
            case MATCH_FOUND:
                type = NotificationType.MATCH_FOUND;
                title = "Eşya Eşleşmesi Bulundu";
                description = "\"" + report.getTitle() + "\" bildirinizle eşleşen bir eşya bulundu.";
                break;
            case REVISION_REQUESTED:
                type = NotificationType.REVISION_REQUESTED;
                title = "Düzenleme İstendi";
                description = "\"" + report.getTitle() + "\" bildiriniz için düzenleme istendi.";
                break;
            case REJECTED:
                type = NotificationType.GENERAL;
                title = "Bildiriniz Reddedildi";
                description = "\"" + report.getTitle() + "\" kayıp bildiriniz reddedildi.";
                break;
            default:
                return; // Diğer durumlar için bildirim gönderme
        }

        Notification notification = new Notification();
        notification.setUser(report.getStudent());
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setType(type);
        notification.setReport(report);

        notificationRepository.save(notification);
    }

    /**
     * Teslim talebi durum değişikliğinde öğrenciye bildirim gönderir.
     * Örn: onaylandı, reddedildi, ek bilgi istendi.
     */
    public void sendClaimNotification(ClaimRequest claim) {
        NotificationType type;
        String title;
        String description;

        switch (claim.getStatus()) {
            case APPROVED:
                type = NotificationType.CLAIM_APPROVED;
                title = "Teslim Talebiniz Onaylandı";
                description = "Teslim talebiniz onaylandı. Eşyanızı teslim alabilirsiniz.";
                break;
            case REJECTED:
                type = NotificationType.CLAIM_REJECTED;
                title = "Teslim Talebiniz Reddedildi";
                description = "Teslim talebiniz reddedildi.";
                break;
            case INFO_REQUESTED:
                type = NotificationType.GENERAL;
                title = "Ek Bilgi İstendi";
                description = "Teslim talebiniz için ek bilgi istendi.";
                break;
            default:
                return;
        }

        Notification notification = new Notification();
        notification.setUser(claim.getStudent());
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setType(type);
        notification.setClaim(claim);
        notification.setItem(claim.getItem());

        notificationRepository.save(notification);
    }

    /**
     * Teslim gerçekleştiğinde öğrenciye bildirim gönderir.
     */
    public void sendDeliveryNotification(Delivery delivery, User student) {
        Notification notification = new Notification();
        notification.setUser(student);
        notification.setTitle("Eşyanız Teslim Edildi");
        notification.setDescription("\"" + delivery.getItem().getTitle() + "\" eşyanız teslim edildi.");
        notification.setType(NotificationType.ITEM_DELIVERED);
        notification.setItem(delivery.getItem());
        notification.setDelivery(delivery);

        notificationRepository.save(notification);
    }
}
