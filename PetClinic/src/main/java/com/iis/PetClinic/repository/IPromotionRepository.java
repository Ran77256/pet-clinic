// com/iis/PetClinic/repository/PromotionRepository.java
package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IPromotionRepository extends JpaRepository<Promotion, Long> { }
