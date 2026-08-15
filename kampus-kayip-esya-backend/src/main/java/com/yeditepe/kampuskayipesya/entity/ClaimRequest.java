package com.yeditepe.kampuskayipesya.entity;

import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_requests", indexes = {
        @Index(name = "idx_claim_status", columnList = "status"),
        @Index(name = "idx_claim_item", columnList = "item_id"),
        @Index(name = "idx_claim_student", columnList = "student_id")
})
public class ClaimRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private FoundItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String distinguishingFeature;

    @Column(columnDefinition = "TEXT")
    private String additionalNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimRequestStatus status;

    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ClaimRequestStatus.PENDING;
        }
    }

    // ==================== GETTER ve SETTER ====================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoundItem getItem() {
        return item;
    }

    public void setItem(FoundItem item) {
        this.item = item;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
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