package com.yeditepe.kampuskayipesya.dto;

import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import jakarta.validation.constraints.NotNull;

public class ClaimReviewRequest {

    @NotNull(message = "Durum boş olamaz")
    private ClaimRequestStatus status;

    private String adminNote;

    public ClaimReviewRequest() {
    }

    public ClaimRequestStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimRequestStatus status) {
        this.status = status;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}
