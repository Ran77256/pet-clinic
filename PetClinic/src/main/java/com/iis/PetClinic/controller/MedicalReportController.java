package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.MedicalReportCreateRequest;
import com.iis.PetClinic.dto.request.MedicalReportUpdateRequest;
import com.iis.PetClinic.dto.response.MedicalReportResponse;
import com.iis.PetClinic.service.IMedicalReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(value = "/api/reports", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin
@RequiredArgsConstructor
public class MedicalReportController {

    private final IMedicalReportService service;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalReportResponse create(@RequestBody MedicalReportCreateRequest req) {
        return service.create(req);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public MedicalReportResponse update(@PathVariable Long id,
                                         @RequestBody MedicalReportUpdateRequest req) {
        return service.update(id, req);
    }

    @GetMapping("/{id}")
    public MedicalReportResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // liste za UI
    @GetMapping("/by-pet/{petId}")
    public List<MedicalReportResponse> listByPet(@PathVariable Long petId) {
        return service.listByPet(petId);
    }

    @GetMapping("/by-vet/{vetId}")
    public List<MedicalReportResponse> listByVet(@PathVariable Long vetId) {
        return service.listByVeterinarian(vetId);
    }

    @GetMapping("/by-pet/{petId}/between")
    public List<MedicalReportResponse> listByPetBetween(@PathVariable Long petId,
                                                        @RequestParam LocalDate from,
                                                        @RequestParam LocalDate to) {
        return service.listByPetAndDate(petId, from, to);
    }
}
