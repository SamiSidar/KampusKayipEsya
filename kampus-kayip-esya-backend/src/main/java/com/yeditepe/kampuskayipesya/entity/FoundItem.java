package com.yeditepe.kampuskayipesya.entity;

import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import com.yeditepe.kampuskayipesya.enums.FoundItemStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "found_items", indexes = {
        @Index(name = "idx_found_item_status", columnList = "status"),
        @Index(name = "idx_found_item_category", columnList = "category"),
        @Index(name = "idx_found_item_created_at", columnList = "createdAt")
})
public class FoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoundItemCategory category;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDate foundDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoundItemStatus status;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String storageLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deliveredAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = FoundItemStatus.WAITING_OWNER;
        }
    }

    // ==================== GETTER ve SETTER ====================

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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getFoundDate() {
        return foundDate;
    }

    public void setFoundDate(LocalDate foundDate) {
        this.foundDate = foundDate;
    }

    public FoundItemStatus getStatus() {
        return status;
    }

    public void setStatus(FoundItemStatus status) {
        this.status = status;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
}