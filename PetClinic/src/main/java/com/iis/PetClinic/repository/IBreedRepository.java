package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Breed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IBreedRepository extends JpaRepository<Breed, Long> {
    // IBreedRepository
    Optional<Breed> findByName(String name);
}