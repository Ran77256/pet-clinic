package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.request.AnimalTypeDTO;
import com.iis.PetClinic.dto.request.BreedDTO;
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
}
@Override
    public List<AnimalTypeDTO> getAllAsDTO() {
        return animalTypeRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public AnimalTypeDTO toDTO(AnimalType t) {
        var breedDTOs = (t.getBreeds() == null) ? List.<BreedDTO>of()
                : t.getBreeds().stream()
                .map(b -> new BreedDTO(b.getId(), b.getName()))
                .toList();

        return new AnimalTypeDTO(t.getId(), t.getName(), breedDTOs);
    }


}