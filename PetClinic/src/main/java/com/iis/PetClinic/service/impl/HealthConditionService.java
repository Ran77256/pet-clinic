package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.HealthCondition;

import com.iis.PetClinic.repository.IHealthConditionRepository;
import com.iis.PetClinic.service.IHealthConditionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HealthConditionService implements IHealthConditionService {
    @Autowired
    private IHealthConditionRepository healthConditionRepository;

    @Override
    public HealthCondition addHealthCondition(HealthCondition healthCondition) {
        return healthConditionRepository.save(healthCondition);
    }

    @Override
    public List<HealthCondition> getAllHealthConditions() {
        return healthConditionRepository.findAll();
    }

    @Override
    public void deleteHealthCondition(Long id) {
        if (healthConditionRepository.existsById(id)) {
            healthConditionRepository.deleteById(id);
        } else {
            throw new RuntimeException("Zdravstveno stanje sa ID " + id + " nije pronađeno.");
        }
    }
}