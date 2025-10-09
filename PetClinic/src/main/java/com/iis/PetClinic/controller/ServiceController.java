// com/iis/PetClinic/controller/ServiceController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.Service;
import com.iis.PetClinic.service.impl.ClinicServiceServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ClinicServiceServiceImpl serviceEntityService;

    // ✅ Get all services
    @GetMapping("/all")
    public List<Service> getAllServices() {
        return serviceEntityService.findAll();
    }

    // ✅ Get one service by ID
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        return serviceEntityService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Add new service\
    @PostMapping(
            value = "/add",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )

    public Service addService(@RequestBody Service service) {
        return serviceEntityService.create(service);
    }

    // ✅ Update existing service
    @PutMapping("/update/{id}")
    public Service updateService(@PathVariable Long id, @RequestBody Service updatedService) {
        return serviceEntityService.update(id, updatedService);
    }

    // ✅ Delete service by ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceEntityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
