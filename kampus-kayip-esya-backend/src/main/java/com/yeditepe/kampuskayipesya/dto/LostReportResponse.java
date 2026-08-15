package com.yeditepe.kampuskayipesya.dto;

import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import com.yeditepe.kampuskayipesya.enums.LostReportStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LostReportResponse {

    private Long id;
    private String title;
    private FoundItemCategory category;
    private String lostLocation;
    private LocalDate lostDate;
    private String description;
    private LostReportStatus status;
    private UserResponse student;
    private String imageUrl;
    private FoundItemResponse matchedItem;
    private String adminNote;
    private String revisionNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LostReportResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public FoundItemCategory getCategory() {
        return category;
    }

    public void setCategory(FoundItemCategory category) {
        this.category = category;
    }

    public String getLostLocation() {
        return lostLocation;
    }

    public void setLostLocation(String lostLocation) {
        this.lostLocation = lostLocation;
    }

    public LocalDate getLostDate() {
        return lostDate;
    }

    public void setLostDate(LocalDate lostDate) {
        this.lostDate = lostDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LostReportStatus getStatus() {
        return status;
    }

    public void setStatus(LostReportStatus status) {
        this.status = status;
    }

    public UserResponse getStudent() {
        return student;
    }

    public void setStudent(UserResponse student) {
        this.student = student;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public FoundItemResponse getMatchedItem() {
        return matchedItem;
    }

    public void setMatchedItem(FoundItemResponse matchedItem) {
        this.matchedItem = matchedItem;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
