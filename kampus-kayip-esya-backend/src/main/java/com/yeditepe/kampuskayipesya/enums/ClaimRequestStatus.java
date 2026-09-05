package com.yeditepe.kampuskayipesya.enums;

import java.util.Map;
import java.util.Set;

/**
 * Teslim talebinin durumu.
 *
 * PENDING        : admin incelemesi bekliyor
 * INFO_REQUESTED : adminden ek bilgi istendi
 * APPROVED       : onaylandı, teslim kaydı oluşturulabilir
 * REJECTED       : reddedildi
 * COMPLETED      : eşya teslim edildi, talep kapandı
 */
public enum ClaimRequestStatus {
    PENDING,
    INFO_REQUESTED,
    APPROVED,
    REJECTED,
    COMPLETED;

    /**
     * Geçerli durum geçişleri.
     * Örn: PENDING → APPROVED, REJECTED, INFO_REQUESTED
     */
    private static final Map<ClaimRequestStatus, Set<ClaimRequestStatus>> VALID_TRANSITIONS = Map.of(
            PENDING, Set.of(APPROVED, REJECTED, INFO_REQUESTED),
            INFO_REQUESTED, Set.of(PENDING, APPROVED, REJECTED),
            APPROVED, Set.of(COMPLETED)
            // REJECTED ve COMPLETED → terminal durumlar, geçiş yapılamaz
    );

    /** Verilen hedefe geçiş yapılabilir mi? */
    public boolean canTransitionTo(ClaimRequestStatus target) {
        Set<ClaimRequestStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(target);
    }
}