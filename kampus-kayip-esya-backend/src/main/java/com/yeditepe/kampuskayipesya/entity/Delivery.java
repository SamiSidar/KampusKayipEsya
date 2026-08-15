package com.yeditepe.kampuskayipesya.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private FoundItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id")
    private ClaimRequest claim;

    @Column(nullable = false)
    private String deliveredToName;

    private String deliveredToStudentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivered_by_id", nullable = false)
    private User deliveredBy;

    @Column(nullable = false)
    private LocalDateTime deliveredAt;

    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @PrePersist
    protected void onCreate() {
        if (this.deliveredAt == null) {
            this.deliveredAt = LocalDateTime.now();
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

    public ClaimRequest getClaim() {
        return claim;
    }

    public void setClaim(ClaimRequest claim) {
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

    public User getDeliveredBy() {
        return deliveredBy;
    }

    public void setDeliveredBy(User deliveredBy) {
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