package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.ClaimRequest;
import com.yeditepe.kampuskayipesya.enums.ClaimRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRequestRepository extends JpaRepository<ClaimRequest, Long> {

    List<ClaimRequest> findByStudentId(Long studentId);

    List<ClaimRequest> findByItemId(Long itemId);

    List<ClaimRequest> findByStatus(ClaimRequestStatus status);

    List<ClaimRequest> findByItemIdAndStatus(Long itemId, ClaimRequestStatus status);

    List<ClaimRequest> findByStudentIdAndStatus(Long studentId, ClaimRequestStatus status);

    boolean existsByItemIdAndStudentId(Long itemId, Long studentId);

    List<ClaimRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(ClaimRequestStatus status);
}