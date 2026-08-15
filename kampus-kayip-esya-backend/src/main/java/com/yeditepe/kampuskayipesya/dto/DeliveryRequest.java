package com.yeditepe.kampuskayipesya.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DeliveryRequest {

    @NotNull(message = "Eşya ID boş olamaz")
    private Long itemId;

    private Long claimId;

    @NotBlank(message = "Teslim alan kişi adı boş olamaz")
    private String deliveredToName;

    private String deliveredToStudentNumber;

    private String adminNote;

    public DeliveryRequest() {
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
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

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}
