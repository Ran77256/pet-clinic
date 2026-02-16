package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface IPetRepository extends JpaRepository<Pet, Long> {

    Optional<Pet> findByMicrochipNumber(String microchipNumber);

    List<Pet> findAllByOwner_Id(Long ownerId);
    List<Pet> findAllByAnimaltype_Id(Long animalTypeId);
    List<Pet> findAllByBreed_Id(Long breedId);

    // ✔ ispravno: pretraga po ID-ju povezanog entiteta
    List<Pet> findByVeterinarian_Id(Long veterinarianId);



    @Query(value = """
        select p.* from pets p
        left join users u on u.id = p.owner_id
        where
            (:q is null or :q = '')
            or p.name ilike concat('%', :q, '%')
            or p.microchip_number ilike concat('%', :q, '%')
            or u.first_name ilike concat('%', :q, '%')
            or u.last_name  ilike concat('%', :q, '%')
            or u.email      ilike concat('%', :q, '%')
        order by p.name asc
        limit :limit
        """, nativeQuery = true)
    List<Pet> searchPetsPg(@Param("q") String q, @Param("limit") int limit);
}
