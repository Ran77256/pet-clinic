package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.HealthCondition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IHealthConditionRepository extends JpaRepository<HealthCondition, Long> {
    //void deleteHealthCondition(Long id);
}