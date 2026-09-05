package com.yeditepe.kampuskayipesya.enums;

/**
 * Bulunan eşyanın durumu.
 *
 * WAITING_OWNER   : kayıtlı, sahibi bekleniyor
 * CLAIM_REQUESTED : biri bu eşya için teslim talebi açtı
 * DELIVERED       : sahibine teslim edildi
 * ARCHIVED        : kaydı kapatıldı
 *
 * isEditable() son iki durumda false döner; teslim edilmiş veya
 * arşivlenmiş eşya artık güncellenemez.
 */
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