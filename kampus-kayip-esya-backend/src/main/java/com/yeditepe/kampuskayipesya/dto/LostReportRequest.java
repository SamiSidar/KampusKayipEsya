package com.yeditepe.kampuskayipesya.dto;

import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LostReportRequest {

    @NotBlank(message = "Başlık boş olamaz")
    private String title;

    @NotNull(message = "Kategori boş olamaz")
    private FoundItemCategory category;

    @NotBlank(message = "Kayıp konumu boş olamaz")
    private String lostLocation;

    @NotBlank(message = "Kayıp tarihi boş olamaz")
    private String lostDate;

    @NotBlank(message = "Açıklama boş olamaz")
    private String description;

    private String imageUrl;

    public LostReportRequest() {
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

    public String getLostDate() {
        return lostDate;
    }

    public void setLostDate(String lostDate) {
        this.lostDate = lostDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
