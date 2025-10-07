package com.iis.PetClinic.service;

import com.iis.PetClinic.model.AnimalType;

import java.util.List;

public interface IAnimalTypeService {
    AnimalType addAnimalType(AnimalType animalType);

    List<AnimalType> getAllAnimalTypes();

    void deleteHealthCondition(Long id);
}
