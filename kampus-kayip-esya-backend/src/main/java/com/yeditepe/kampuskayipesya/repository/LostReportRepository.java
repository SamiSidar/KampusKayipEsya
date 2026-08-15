package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.LostReport;
import com.yeditepe.kampuskayipesya.enums.FoundItemCategory;
import com.yeditepe.kampuskayipesya.enums.LostReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostReportRepository extends JpaRepository<LostReport, Long> {

    List<LostReport> findByStudentId(Long studentId);

    List<LostReport> findByStatus(LostReportStatus status);

    List<LostReport> findByStudentIdAndStatus(Long studentId, LostReportStatus status);

    List<LostReport> findByCategory(FoundItemCategory category);

    List<LostReport> findByCategoryAndStatus(FoundItemCategory category, LostReportStatus status);

    List<LostReport> findAllByOrderByCreatedAtDesc();

    List<LostReport> findByStatusOrderByCreatedAtDesc(LostReportStatus status);

    long countByStatus(LostReportStatus status);
}