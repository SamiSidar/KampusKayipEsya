package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.FileRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRecordRepository extends JpaRepository<FileRecord, Long> {

    List<FileRecord> findByFoundItemId(Long foundItemId);

    List<FileRecord> findByLostReportId(Long lostReportId);

    List<FileRecord> findByClaimRequestId(Long claimRequestId);

    List<FileRecord> findByUploadedById(Long userId);
}