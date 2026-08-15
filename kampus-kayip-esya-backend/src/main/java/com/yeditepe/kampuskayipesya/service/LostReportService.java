package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.LostReportRequest;
import com.yeditepe.kampuskayipesya.dto.LostReportResponse;
import com.yeditepe.kampuskayipesya.dto.ReportReviewRequest;
import com.yeditepe.kampuskayipesya.entity.FoundItem;
import com.yeditepe.kampuskayipesya.entity.LostReport;
import com.yeditepe.kampuskayipesya.entity.User;
import com.yeditepe.kampuskayipesya.enums.LostReportStatus;
import com.yeditepe.kampuskayipesya.exception.BadRequestException;
import com.yeditepe.kampuskayipesya.exception.ResourceNotFoundException;
import com.yeditepe.kampuskayipesya.repository.FoundItemRepository;
import com.yeditepe.kampuskayipesya.repository.LostReportRepository;
import com.yeditepe.kampuskayipesya.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * LostReportService — Kayıp eşya bildirisi servisi.
 *
 * Ne yapar:
 * - Öğrenci kayıp bildirisi oluşturur
 * - Öğrenci kendi bildirilerini görür
 * - Admin tüm bildirileri listeler, onaylar, reddeder veya düzenleme ister
 * - Admin bir bildiriyi bulunan eşyayla eşleştirir (match)
 *
 * Neden gerekli:
 * Kayıp eşya akışının çekirdeğidir. Öğrenci "eşyamı kaybettim" der,
 * admin inceler ve bulunan eşyayla eşleştirirse öğrenciye bildirim gider.
 */
@Service
public class LostReportService {

    private final LostReportRepository lostReportRepository;
    private final UserRepository userRepository;
    private final FoundItemRepository foundItemRepository;
    private final NotificationService notificationService;
    private final DtoMapper dtoMapper;

    public LostReportService(LostReportRepository lostReportRepository,
                             UserRepository userRepository,
                             FoundItemRepository foundItemRepository,
                             NotificationService notificationService,
                             DtoMapper dtoMapper) {
        this.lostReportRepository = lostReportRepository;
        this.userRepository = userRepository;
        this.foundItemRepository = foundItemRepository;
        this.notificationService = notificationService;
        this.dtoMapper = dtoMapper;
    }

    /** Tüm bildirileri yeniden eskiye listeler (admin için). */
    public List<LostReportResponse> getAllReports() {
        return lostReportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(dtoMapper::toLostReportResponse)
                .collect(Collectors.toList());
    }

    /** Belirli statüdeki bildirileri getirir (örn: PENDING_REVIEW). */
    public List<LostReportResponse> getReportsByStatus(LostReportStatus status) {
        return lostReportRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(dtoMapper::toLostReportResponse)
                .collect(Collectors.toList());
    }

    /** Öğrencinin kendi bildirilerini getirir. */
    public List<LostReportResponse> getReportsByStudent(Long studentId) {
        return lostReportRepository.findByStudentId(studentId)
                .stream()
                .map(dtoMapper::toLostReportResponse)
                .collect(Collectors.toList());
    }

    /** Tekil bildiri detayı. */
    public LostReportResponse getReportById(Long reportId) {
        LostReport report = lostReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Kayıp bildirisi", "id", reportId));
        return dtoMapper.toLostReportResponse(report);
    }

    /** Öğrenci yeni kayıp bildirisi oluşturur. */
    public LostReportResponse createReport(LostReportRequest request, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", "id", studentId));

        LostReport report = new LostReport();
        report.setTitle(request.getTitle());
        report.setCategory(request.getCategory());
        report.setLostLocation(request.getLostLocation());
        report.setLostDate(LocalDate.parse(request.getLostDate()));
        report.setDescription(request.getDescription());
        report.setImageUrl(request.getImageUrl());
        report.setStudent(student);
        // status @PrePersist ile PENDING_REVIEW olarak atanır

        LostReport saved = lostReportRepository.save(report);
        return dtoMapper.toLostReportResponse(saved);
    }

    /**
     * Öğrenci, düzenleme istenen bildiriyi günceller.
     * Sadece REVISION_REQUESTED durumundaki bildiriler güncellenebilir.
     */
    public LostReportResponse updateReport(Long reportId, LostReportRequest request, Long studentId) {
        LostReport report = lostReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Kayıp bildirisi", "id", reportId));

        // Sadece kendi bildirisini güncelleyebilir
        if (!report.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Bu bildiriyi güncelleme yetkiniz yok");
        }

        // Sadece düzenleme istenmiş bildiriler güncellenebilir
        if (report.getStatus() != LostReportStatus.REVISION_REQUESTED) {
            throw new BadRequestException("Bu bildiri şu an güncellenemez");
        }

        report.setTitle(request.getTitle());
        report.setCategory(request.getCategory());
        report.setLostLocation(request.getLostLocation());
        report.setLostDate(LocalDate.parse(request.getLostDate()));
        report.setDescription(request.getDescription());
        if (request.getImageUrl() != null) {
            report.setImageUrl(request.getImageUrl());
        }
        report.setStatus(LostReportStatus.PENDING_REVIEW); // Tekrar incelemeye gönder
        report.setRevisionNote(null); // Eski notu temizle

        LostReport saved = lostReportRepository.save(report);
        return dtoMapper.toLostReportResponse(saved);
    }

    /**
     * Admin bildiriyi inceler: onaylar, reddeder, düzenleme ister veya eşleştirir.
     * Her durum değişikliğinde öğrenciye bildirim gönderilir.
     */
    public LostReportResponse reviewReport(Long reportId, ReportReviewRequest request) {
        LostReport report = lostReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Kayıp bildirisi", "id", reportId));

        LostReportStatus newStatus = request.getStatus();

        // Durum geçişi kontrolü — geçersiz geçişleri engelle
        if (!report.getStatus().canTransitionTo(newStatus)) {
            throw new BadRequestException(
                    "'" + report.getStatus() + "' durumundaki bildiri '" + newStatus + "' durumuna geçirilemez");
        }

        report.setStatus(newStatus);
        report.setAdminNote(request.getAdminNote());

        // Düzenleme isteniyorsa notu kaydet
        if (newStatus == LostReportStatus.REVISION_REQUESTED) {
            report.setRevisionNote(request.getRevisionNote());
        }

        // Eşleştirme yapılıyorsa bulunan eşyayı bağla
        if (newStatus == LostReportStatus.MATCH_FOUND && request.getMatchedItemId() != null) {
            FoundItem matchedItem = foundItemRepository.findById(request.getMatchedItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bulunan eşya", "id", request.getMatchedItemId()));
            report.setMatchedItem(matchedItem);
        }

        LostReport saved = lostReportRepository.save(report);

        // Öğrenciye bildirim gönder
        notificationService.sendReportNotification(saved);

        return dtoMapper.toLostReportResponse(saved);
    }
}
