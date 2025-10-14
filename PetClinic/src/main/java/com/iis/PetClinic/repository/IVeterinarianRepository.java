package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Veterinarian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IVeterinarianRepository extends JpaRepository<Veterinarian, Long> {

    // Search by linked user's first/last name
    @Query("""
    SELECT v
    FROM Veterinarian v
    JOIN v.user u
    WHERE LOWER(u.lastName) LIKE LOWER(CONCAT('%', :q, '%'))
       OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
    """)
    List<Veterinarian> searchByUserName(@Param("q") String q);

    // Derived queries using nested property path
    boolean existsByUser_EmailIgnoreCase(String email);

    Optional<Veterinarian> findByUser_Id(Long userId);

}
