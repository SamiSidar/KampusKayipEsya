package com.yeditepe.kampuskayipesya.repository;

import com.yeditepe.kampuskayipesya.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByItemId(Long itemId);

    Optional<Delivery> findByClaimId(Long claimId);

    List<Delivery> findByDeliveredById(Long userId);

    List<Delivery> findAllByOrderByDeliveredAtDesc();

    boolean existsByItemId(Long itemId);
}