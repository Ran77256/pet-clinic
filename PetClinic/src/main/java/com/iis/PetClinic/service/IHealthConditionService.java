package com.iis.PetClinic.service;

import com.iis.PetClinic.model.HealthCondition;

import java.util.List;

public interface IHealthConditionService {
    HealthCondition addHealthCondition(HealthCondition healthCondition);
    List<HealthCondition> getAllHealthConditions();

    void deleteHealthCondition(Long id);
}