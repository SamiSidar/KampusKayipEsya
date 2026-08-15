package com.yeditepe.kampuskayipesya.dto;

import com.yeditepe.kampuskayipesya.enums.LostReportStatus;
import jakarta.validation.constraints.NotNull;

public class ReportReviewRequest {

    @NotNull(message = "Durum boş olamaz")
    private LostReportStatus status;

    private String adminNote;

    private String revisionNote;

    private Long matchedItemId;

    public ReportReviewRequest() {
    }

    public LostReportStatus getStatus() {
        return status;
    }

    public void setStatus(LostReportStatus status) {
        this.status = status;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }

    public String getRevisionNote() {
        return revisionNote;
    }

    public void setRevisionNote(String revisionNote) {
        this.revisionNote = revisionNote;
    }

    public Long getMatchedItemId() {
        return matchedItemId;
    }

    public void setMatchedItemId(Long matchedItemId) {
        this.matchedItemId = matchedItemId;
    }
}
