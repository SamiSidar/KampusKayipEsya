package com.yeditepe.kampuskayipesya.enums;

import java.util.Map;
import java.util.Set;

public enum LostReportStatus {
    PENDING_REVIEW,
    REVISION_REQUESTED,
    APPROVED,
    MATCH_FOUND,
    REJECTED,
    CLOSED;

    /**
     * Geçerli durum geçişleri.
     * Örn: PENDING_REVIEW → APPROVED, REJECTED, REVISION_REQUESTED
     */
    private static final Map<LostReportStatus, Set<LostReportStatus>> VALID_TRANSITIONS = Map.of(
            PENDING_REVIEW, Set.of(APPROVED, REJECTED, REVISION_REQUESTED),
            REVISION_REQUESTED, Set.of(PENDING_REVIEW),
            APPROVED, Set.of(MATCH_FOUND, CLOSED),
            MATCH_FOUND, Set.of(CLOSED)
            // REJECTED ve CLOSED → terminal durumlar, geçiş yapılamaz
    );

    /** Verilen hedefe geçiş yapılabilir mi? */
    public boolean canTransitionTo(LostReportStatus target) {
        Set<LostReportStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(target);
    }
}