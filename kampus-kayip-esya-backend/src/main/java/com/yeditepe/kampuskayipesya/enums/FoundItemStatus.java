package com.yeditepe.kampuskayipesya.enums;

public enum FoundItemStatus {
    WAITING_OWNER,
    CLAIM_REQUESTED,
    DELIVERED,
    ARCHIVED;

    /** Teslim edilmiş veya arşivlenmiş eşya güncellenemez. */
    public boolean isEditable() {
        return this != DELIVERED && this != ARCHIVED;
    }
}