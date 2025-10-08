package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IPetRepository extends JpaRepository<Pet, Long> {

    // Jedan mikrocip = jedan ljubimac
    Optional<Pet> findByMicrochipNumber(String microchipNumber);

    // Filtri po odnosima
    List<Pet> findAllByOwner_Id(Long ownerId);
    List<Pet> findAllByAnimaltype_Id(Long animalTypeId);
    List<Pet> findAllByBreed_Id(Long breedId);
}
