package com.yeditepe.kampuskayipesya.dto;

import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FoundItemRequest {

    @NotBlank(message = "Başlık boş olamaz")
    private String title;

    @NotNull(message = "Kategori boş olamaz")
    private FoundItemCategory category;

    @NotBlank(message = "Bulunan konum boş olamaz")
    private String location;

    @NotBlank(message = "Bulunma tarihi boş olamaz")
    private String foundDate;

    private String description;

    private String storageLocation;

    private String imageUrl;

    public FoundItemRequest() {
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

    public String getFoundDate() {
        return foundDate;
    }

    public void setFoundDate(String foundDate) {
        this.foundDate = foundDate;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
