package com.iis.PetClinic.repository;


import com.iis.PetClinic.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import com.iis.PetClinic.dto.response.PetLiteDTO;
import com.iis.PetClinic.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;
import java.util.Optional;

public interface IPetRepository extends JpaRepository<Pet, Long> {

    // Jedan mikrocip = jedan ljubimac
    Optional<Pet> findByMicrochipNumber(String microchipNumber);

    // Filtri po odnosima
    List<Pet> findAllByOwner_Id(Long ownerId);

    List<Pet> findAllByAnimaltype_Id(Long animalTypeId);
    List<Pet> findAllByBreed_Id(Long breedId);





    // IPetRepository
    @Query("""
  select new com.iis.PetClinic.dto.response.PetLiteDTO(
    p.id,
    coalesce(p.description, concat('Ljubimac #', p.id)),
    concat(p.owner.firstName, ' ', p.owner.lastName)
  )
  from Pet p
  order by p.id
""")
    List<PetLiteDTO> findAllLite();

    @Query("""
  select new com.iis.PetClinic.dto.response.PetLiteDTO(
    p.id,
    coalesce(p.description, concat('Ljubimac #', p.id)),
    concat(p.owner.firstName, ' ', p.owner.lastName)
  )
  from Pet p
  where lower(coalesce(p.description, '')) like lower(concat('%', :q, '%'))
     or lower(p.owner.firstName) like lower(concat('%', :q, '%'))
     or lower(p.owner.lastName)  like lower(concat('%', :q, '%'))
  order by p.id
""")
    List<PetLiteDTO> searchLite(String q);
}

