package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Breed;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IBreedRepository extends JpaRepository<Breed, Long> {
}