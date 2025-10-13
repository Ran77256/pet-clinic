package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Veterinarian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IVeterinarianRepository extends JpaRepository<Veterinarian, Long> {
    List<Veterinarian> findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCase(String ln, String fn);
    boolean existsByEmailIgnoreCase(String email);
}
