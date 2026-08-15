package com.yeditepe.kampuskayipesya.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ClaimRequestCreateDTO {

    @NotNull(message = "Eşya ID boş olamaz")
    private Long itemId;

    @NotBlank(message = "Açıklama boş olamaz")
    private String description;

    @NotBlank(message = "Ayırt edici özellik boş olamaz")
    private String distinguishingFeature;

    private String additionalNote;

    public ClaimRequestCreateDTO() {
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
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
}
