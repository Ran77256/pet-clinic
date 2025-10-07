package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.AnimalType;
import com.iis.PetClinic.service.IAnimalTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animal-types")
public class AnimalTypeController {
    @Autowired
    private IAnimalTypeService animalTypeService;
    @RequestMapping("/add")
    @PostMapping
    public AnimalType addAnimalType(@RequestBody AnimalType animalType) {
        return animalTypeService.addAnimalType(animalType);
    }
    @RequestMapping("/all")
    @GetMapping
    public List<AnimalType> getAllAnimalTypes() {
        return animalTypeService.getAllAnimalTypes();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteHealthCondition(@PathVariable Long id) {
        animalTypeService.deleteHealthCondition(id);
    }
}