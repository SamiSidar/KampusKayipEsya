package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.FoundItem;
import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import com.yeditepe.kampuskayipesya.enums.FoundItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {

    List<FoundItem> findByStatus(FoundItemStatus status);

    List<FoundItem> findByCategory(FoundItemCategory category);

    List<FoundItem> findByCategoryAndStatus(FoundItemCategory category, FoundItemStatus status);

    List<FoundItem> findByCreatedById(Long userId);

    List<FoundItem> findByTitleContainingIgnoreCase(String keyword);

    List<FoundItem> findAllByOrderByCreatedAtDesc();

    List<FoundItem> findByStatusOrderByCreatedAtDesc(FoundItemStatus status);
}