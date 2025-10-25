package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.ServiceUsage;
import com.iis.PetClinic.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface IServiceUsageRepository extends JpaRepository<ServiceUsage, Long> {

    List<ServiceUsage> findByPromotion(Promotion promotion);

    @Query("SELECT su FROM ServiceUsage su WHERE su.usageDate BETWEEN :from AND :to AND su.promotion = :promotion")
    List<ServiceUsage> findByPromotionAndPeriod(@Param("promotion") Promotion promotion,
                                               @Param("from") LocalDateTime from,
                                               @Param("to") LocalDateTime to);
}
