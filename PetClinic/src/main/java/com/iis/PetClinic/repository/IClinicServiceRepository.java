// com/iis/PetClinic/repository/ClinicServiceRepository.java
package com.iis.PetClinic.repository;


import com.iis.PetClinic.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IClinicServiceRepository extends JpaRepository<Service, Long> { }
