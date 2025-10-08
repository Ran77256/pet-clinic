package com.iis.PetClinic.repository;
import com.iis.PetClinic.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface IServiceRepository extends JpaRepository<Service, Long> {

    // IServiceRepository
    Optional<Service> findByName(String name);
}