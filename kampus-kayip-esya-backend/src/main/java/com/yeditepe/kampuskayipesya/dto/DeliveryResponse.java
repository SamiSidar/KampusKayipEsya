package com.yeditepe.kampuskayipesya.dto;

import java.time.LocalDateTime;

public class DeliveryResponse {

    private Long id;
    private FoundItemResponse item;
    private ClaimRequestResponse claim;
    private String deliveredToName;
    private String deliveredToStudentNumber;
    private UserResponse deliveredBy;
    private LocalDateTime deliveredAt;
    private String adminNote;

    public DeliveryResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoundItemResponse getItem() {
        return item;
    }

    public void setItem(FoundItemResponse item) {
        this.item = item;
    }

    public ClaimRequestResponse getClaim() {
        return claim;
    }

    public void setClaim(ClaimRequestResponse claim) {
        this.claim = claim;
    }

    public String getDeliveredToName() {
        return deliveredToName;
    }

    public void setDeliveredToName(String deliveredToName) {
        this.deliveredToName = deliveredToName;
    }

    public String getDeliveredToStudentNumber() {
        return deliveredToStudentNumber;
    }

    public void setDeliveredToStudentNumber(String deliveredToStudentNumber) {
        this.deliveredToStudentNumber = deliveredToStudentNumber;
    }

    public UserResponse getDeliveredBy() {
        return deliveredBy;
    }

    public void setDeliveredBy(UserResponse deliveredBy) {
        this.deliveredBy = deliveredBy;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}
