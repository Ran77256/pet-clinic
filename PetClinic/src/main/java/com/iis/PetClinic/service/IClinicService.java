// com/iis/PetClinic/service/ClinicServiceService.java
package com.iis.PetClinic.service;

import com.iis.PetClinic.model.Service;

import java.util.List;
import java.util.Optional;

public interface IClinicService {
    Service create(Service s);
    List<Service> findAll();
    Optional<Service> findById(Long id);
    Service update(Long id, Service s);
    void delete(Long id);
}
