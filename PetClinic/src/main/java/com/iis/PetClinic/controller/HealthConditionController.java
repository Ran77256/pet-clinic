package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.HealthCondition;
import com.iis.PetClinic.service.IHealthConditionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-conditions")
public class HealthConditionController {
    @Autowired
    private IHealthConditionService healthConditionService;

    @PostMapping
    @RequestMapping("/add")
    public HealthCondition addHealthCondition(@RequestBody HealthCondition healthCondition) {
        return healthConditionService.addHealthCondition(healthCondition);
    }

    @GetMapping
    @RequestMapping("/all")
    public List<HealthCondition> getAllHealthConditions() {
        return healthConditionService.getAllHealthConditions();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteHealthCondition(@PathVariable Long id) {
        healthConditionService.deleteHealthCondition(id);
    }
}