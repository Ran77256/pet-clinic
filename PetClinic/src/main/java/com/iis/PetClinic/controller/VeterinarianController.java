// com/iis/PetClinic/controller/VeterinarianController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.VeterinarianResponse;
import com.iis.PetClinic.dto.request.VeterinarianCreateUpdateDTO;
import com.iis.PetClinic.dto.response.VeterinarianResponseDTO;
import com.iis.PetClinic.model.Veterinarian;
import com.iis.PetClinic.repository.IVeterinarianRepository;
import com.iis.PetClinic.service.IVeterinarianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/veterinarians", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@CrossOrigin
public class VeterinarianController {

    private final IVeterinarianService service;
    private final IVeterinarianRepository vetRepo;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public VeterinarianResponseDTO create(@RequestBody VeterinarianCreateUpdateDTO dto) {
        return service.create(dto);
    }

    @PutMapping(value="/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public VeterinarianResponseDTO update(@PathVariable Long id,
                                          @RequestBody VeterinarianCreateUpdateDTO dto) {
        return service.update(id, dto);
    }

    @GetMapping("/{id}")
    public VeterinarianResponseDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/getall")
    public List<VeterinarianResponseDTO> list(@RequestParam(required = false) String q) {
        return service.list(q);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    //  pronađi veterinara po userId
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<VeterinarianResponse> getByUser(@PathVariable Integer userId) {
        Veterinarian v = vetRepo.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("Veterinar ne postoji za userId=" + userId));
        return ResponseEntity.ok(VeterinarianResponse.of(v));
    }


}
