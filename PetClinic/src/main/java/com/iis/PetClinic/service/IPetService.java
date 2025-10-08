package com.iis.PetClinic.service;

import com.iis.PetClinic.model.Pet;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface IPetService {
    Pet create(Pet pet);

    @Transactional(readOnly = true)
    List<Pet> getAll();

    @Transactional(readOnly = true)
    Optional<Pet> getById(Long id);

    @Transactional(readOnly = true)
    Optional<Pet> getByMicrochip(String microchipNumber);

    Pet update(Long id, Pet updated);

    void delete(Long id);


    @Transactional(readOnly = true)
    List<Pet> getByOwner(Long ownerId);

    @Transactional(readOnly = true)
    List<Pet> getByAnimalType(Long animalTypeId);

    @Transactional(readOnly = true)
    List<Pet> getByBreed(Long breedId);


    void assignVeterinarian(Long petId, Long vetId);


}
