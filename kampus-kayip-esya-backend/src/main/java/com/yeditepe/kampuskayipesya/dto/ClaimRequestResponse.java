package com.yeditepe.kampuskayipesya.dto;

import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import java.time.LocalDateTime;

public class ClaimRequestResponse {

    private Long id;
    private FoundItemResponse item;
    private UserResponse student;
    private String description;
    private String distinguishingFeature;
    private String additionalNote;
    private ClaimRequestStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public ClaimRequestResponse() {
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

    public UserResponse getStudent() {
        return student;
    }

    public void setStudent(UserResponse student) {
        this.student = student;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDistinguishingFeature() {
        return distinguishingFeature;
    }

    public void setDistinguishingFeature(String distinguishingFeature) {
        this.distinguishingFeature = distinguishingFeature;
    }

    public String getAdditionalNote() {
        return additionalNote;
    }

    public void setAdditionalNote(String additionalNote) {
        this.additionalNote = additionalNote;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
