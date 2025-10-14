package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.VeterinarianCreateUpdateDTO;
import com.iis.PetClinic.dto.response.VeterinarianResponseDTO;
import com.iis.PetClinic.service.IVeterinarianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/veterinarians", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@CrossOrigin
public class VeterinarianController {

    private final IVeterinarianService service;

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
}
