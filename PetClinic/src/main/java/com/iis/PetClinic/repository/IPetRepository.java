package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IPetRepository extends JpaRepository<Pet, Long> {

    Optional<Pet> findByMicrochipNumber(String microchipNumber);

    List<Pet> findAllByOwner_Id(Long ownerId);
    List<Pet> findAllByAnimaltype_Id(Long animalTypeId);
    List<Pet> findAllByBreed_Id(Long breedId);

    // ✔ ispravno: pretraga po ID-ju povezanog entiteta
    List<Pet> findByVeterinarian_Id(Long veterinarianId);
}
