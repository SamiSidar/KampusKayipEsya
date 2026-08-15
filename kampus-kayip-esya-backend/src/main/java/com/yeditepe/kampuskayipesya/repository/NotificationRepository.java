package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.Notification;
import com.yeditepe.kampuskayipesya.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndType(Long userId, NotificationType type);

    long countByUserIdAndReadFalse(Long userId);
}