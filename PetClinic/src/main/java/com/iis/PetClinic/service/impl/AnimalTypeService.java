package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.AnimalType;
import com.iis.PetClinic.repository.IAnimalTypeRepository;
import com.iis.PetClinic.service.IAnimalTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnimalTypeService implements IAnimalTypeService {
    @Autowired
    private IAnimalTypeRepository animalTypeRepository;

    @Override
    public AnimalType addAnimalType(AnimalType animalType) {
        return animalTypeRepository.save(animalType);
    }

    @Override
    public List<AnimalType> getAllAnimalTypes() {
        return animalTypeRepository.findAll();
    }

    @Override
    public void deleteHealthCondition(Long id) {
        if (animalTypeRepository.existsById(id)) {
            animalTypeRepository.deleteById(id);
        } else {
            throw new RuntimeException("Zdravstveno stanje sa ID " + id + " nije pronađeno.");
        }
}}