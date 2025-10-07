package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.AnimalType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IAnimalTypeRepository extends JpaRepository<AnimalType, Long> {
}