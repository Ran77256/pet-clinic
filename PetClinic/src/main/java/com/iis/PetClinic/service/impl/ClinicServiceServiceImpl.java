// com/iis/PetClinic/service/impl/ClinicServiceServiceImpl.java
package com.iis.PetClinic.service.impl;


import com.iis.PetClinic.dto.response.ServiceDTO;
import com.iis.PetClinic.model.Service;
import com.iis.PetClinic.repository.IClinicServiceRepository;


import com.iis.PetClinic.service.IClinicService;
import lombok.RequiredArgsConstructor;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ClinicServiceServiceImpl implements IClinicService {
    private final IClinicServiceRepository repo;

    @Override public Service create(Service s) { return repo.save(s); }
    @Override public java.util.List<Service> findAll() { return repo.findAll(); }
    @Override public java.util.Optional<Service> findById(Long id) { return repo.findById(id); }

    @Override
    public Service update(Long id, Service s) {
        Service existing = repo.findById(id).orElseThrow();
        existing.setName(s.getName());
        existing.setDescription(s.getDescription());
        existing.setClientType(s.getClientType());
        existing.setAnimalType(s.getAnimalType());
        return repo.save(existing);
    }
    public List<ServiceDTO> findAllServices() {
        return repo.findAll()
                .stream()
                .map(s -> ServiceDTO.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .description(s.getDescription())
                        .clientType(s.getClientType().name())
                        .animalTypeId(s.getAnimalType().getId())
                        .animalTypeName(s.getAnimalType().getName())
                        .build())
                .toList();
    }


    @Override public void delete(Long id) { repo.deleteById(id); }
}
