package com.yeditepe.kampuskayipesya.service;

import com.yeditepe.kampuskayipesya.dto.*;
import com.yeditepe.kampuskayipesya.entity.*;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    // ==================== USER ====================

    public UserResponse toUserResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStudentNumber(user.getStudentNumber());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setDepartment(user.getDepartment());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    // ==================== FOUND ITEM ====================

    public FoundItemResponse toFoundItemResponse(FoundItem item) {
        FoundItemResponse dto = new FoundItemResponse();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setCategory(item.getCategory());
        dto.setLocation(item.getLocation());
        dto.setFoundDate(item.getFoundDate());
        dto.setStatus(item.getStatus());
        dto.setImageUrl(item.getImageUrl());
        dto.setDescription(item.getDescription());
        dto.setStorageLocation(item.getStorageLocation());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setDeliveredAt(item.getDeliveredAt());
        if (item.getCreatedBy() != null) {
            dto.setCreatedBy(toUserResponse(item.getCreatedBy()));
        }
        return dto;
    }

    // ==================== LOST REPORT ====================

    public LostReportResponse toLostReportResponse(LostReport report) {
        LostReportResponse dto = new LostReportResponse();
        dto.setId(report.getId());
        dto.setTitle(report.getTitle());
        dto.setCategory(report.getCategory());
        dto.setLostLocation(report.getLostLocation());
        dto.setLostDate(report.getLostDate());
        dto.setDescription(report.getDescription());
        dto.setStatus(report.getStatus());
        dto.setImageUrl(report.getImageUrl());
        dto.setAdminNote(report.getAdminNote());
        dto.setRevisionNote(report.getRevisionNote());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        if (report.getStudent() != null) {
            dto.setStudent(toUserResponse(report.getStudent()));
        }
        if (report.getMatchedItem() != null) {
            dto.setMatchedItem(toFoundItemResponse(report.getMatchedItem()));
        }
        return dto;
    }

    // ==================== CLAIM REQUEST ====================

    public ClaimRequestResponse toClaimRequestResponse(ClaimRequest claim) {
        ClaimRequestResponse dto = new ClaimRequestResponse();
        dto.setId(claim.getId());
        dto.setDescription(claim.getDescription());
        dto.setDistinguishingFeature(claim.getDistinguishingFeature());
        dto.setAdditionalNote(claim.getAdditionalNote());
        dto.setStatus(claim.getStatus());
        dto.setAdminNote(claim.getAdminNote());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setReviewedAt(claim.getReviewedAt());
        if (claim.getItem() != null) {
            dto.setItem(toFoundItemResponse(claim.getItem()));
        }
        if (claim.getStudent() != null) {
            dto.setStudent(toUserResponse(claim.getStudent()));
        }
        return dto;
    }

    // ==================== DELIVERY ====================

    public DeliveryResponse toDeliveryResponse(Delivery delivery) {
        DeliveryResponse dto = new DeliveryResponse();
        dto.setId(delivery.getId());
        dto.setDeliveredToName(delivery.getDeliveredToName());
        dto.setDeliveredToStudentNumber(delivery.getDeliveredToStudentNumber());
        dto.setDeliveredAt(delivery.getDeliveredAt());
        dto.setAdminNote(delivery.getAdminNote());
        if (delivery.getItem() != null) {
            dto.setItem(toFoundItemResponse(delivery.getItem()));
        }
        if (delivery.getClaim() != null) {
            dto.setClaim(toClaimRequestResponse(delivery.getClaim()));
        }
        if (delivery.getDeliveredBy() != null) {
            dto.setDeliveredBy(toUserResponse(delivery.getDeliveredBy()));
        }
        return dto;
    }

    // ==================== NOTIFICATION ====================

    public NotificationResponse toNotificationResponse(Notification notification) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setDescription(notification.getDescription());
        dto.setType(notification.getType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        if (notification.getReport() != null) {
            dto.setReportId(notification.getReport().getId());
        }
        if (notification.getItem() != null) {
            dto.setItemId(notification.getItem().getId());
        }
        if (notification.getClaim() != null) {
            dto.setClaimId(notification.getClaim().getId());
        }
        if (notification.getDelivery() != null) {
            dto.setDeliveryId(notification.getDelivery().getId());
        }
        return dto;
    }
}