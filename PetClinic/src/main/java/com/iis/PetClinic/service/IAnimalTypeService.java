package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.request.AnimalTypeDTO;
import com.iis.PetClinic.model.AnimalType;

import java.util.List;

public interface IAnimalTypeService {
    AnimalType addAnimalType(AnimalType animalType);

    List<AnimalType> getAllAnimalTypes();

    void deleteHealthCondition(Long id);

    List<AnimalTypeDTO> getAllAsDTO();

    AnimalTypeDTO toDTO(AnimalType t);
}
