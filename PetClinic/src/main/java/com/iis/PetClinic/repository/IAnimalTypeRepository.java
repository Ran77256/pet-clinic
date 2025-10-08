package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.AnimalType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;

public interface IAnimalTypeRepository extends JpaRepository<AnimalType, Long> {


    @EntityGraph(attributePaths = "breeds")
    List<AnimalType> findAll();


    Optional<AnimalType> findByName(String name);

}
