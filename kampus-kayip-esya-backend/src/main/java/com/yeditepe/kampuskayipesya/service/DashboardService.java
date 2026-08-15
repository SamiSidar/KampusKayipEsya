package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.DashboardStatsResponse;
import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import com.yeditepe.kampuskayipesya.enums.LostReportStatus;
import com.yeditepe.kampuskayipesya.repository.*;
import org.springframework.stereotype.Service;

/**
 * DashboardService — Admin panel istatistik servisi.
 *
 * Ne yapar:
 * - Toplam bulunan eşya, kayıp bildirisi, teslim sayısı gibi
 *   özet istatistikleri hesaplar
 *
 * Neden gerekli:
 * Admin panelindeki ana ekranda özet kartlarda gösterilecek
 * sayısal verileri sağlar.
 */
@Service
public class DashboardService {

    private final FoundItemRepository foundItemRepository;
    private final LostReportRepository lostReportRepository;
    private final ClaimRequestRepository claimRequestRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;

    public DashboardService(FoundItemRepository foundItemRepository,
                            LostReportRepository lostReportRepository,
                            ClaimRequestRepository claimRequestRepository,
                            DeliveryRepository deliveryRepository,
                            UserRepository userRepository) {
        this.foundItemRepository = foundItemRepository;
        this.lostReportRepository = lostReportRepository;
        this.claimRequestRepository = claimRequestRepository;
        this.deliveryRepository = deliveryRepository;
        this.userRepository = userRepository;
    }

    /** Admin paneli için tüm özet istatistikleri döner. */
    public DashboardStatsResponse getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalFoundItems(foundItemRepository.count());
        stats.setTotalLostReports(lostReportRepository.count());
        stats.setPendingReports(lostReportRepository.countByStatus(LostReportStatus.PENDING_REVIEW));
        stats.setPendingClaims(claimRequestRepository.countByStatus(ClaimRequestStatus.PENDING));
        stats.setTotalDeliveries(deliveryRepository.count());
        stats.setTotalUsers(userRepository.count());
        return stats;
    }
}
