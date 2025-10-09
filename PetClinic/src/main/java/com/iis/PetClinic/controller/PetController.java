package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.PetDTO;
import com.iis.PetClinic.model.Pet;
import com.iis.PetClinic.service.IPetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin // po potrebi
public class PetController {

    private final IPetService petService;

    public PetController(IPetService petService) {
        this.petService = petService;
    }

    // CREATE
    @PostMapping(
            value = "/add",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Pet> create(@RequestBody Pet pet) {
        Pet saved = petService.create(pet);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // READ - all
    @GetMapping
    public List<Pet> getAll() {
        return petService.getAll();
    }

    // READ - by id
    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getById(@PathVariable Long id) {
        return petService.getById(id)
                .map(pet -> ResponseEntity.ok(mapToDTO(pet)))
                .orElse(ResponseEntity.notFound().build());
    }

    // READ - by microchip
    @GetMapping("/by-microchip/{microchip}")
    public ResponseEntity<Pet> getByMicrochip(@PathVariable("microchip") String microchip) {
        return petService.getByMicrochip(microchip)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // READ - filters
    @GetMapping("/by-owner/{ownerId}")
    public List<PetDTO> getByOwner(@PathVariable Long ownerId) {
        return petService.getByOwner(ownerId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ✅ Mapira Pet → PetDTO
    private PetDTO mapToDTO(Pet pet) {
        return PetDTO.builder()
                .id(pet.getId())
                .name(pet.getName())
                .birthDate(pet.getBirthDate())
                .microchipNumber(pet.getMicrochipNumber())
                .ownerId(pet.getOwner() != null ? (long) pet.getOwner().getId() : null)
                .breedName(pet.getBreed() != null ? pet.getBreed().getName() : null)
                .animalTypeName(pet.getAnimaltype() != null ? pet.getAnimaltype().getName() : null)
                .healthConditions(pet.getHealthConditions())
                .build();
    }


    @GetMapping("/by-species/{animalTypeId}")
    public List<Pet> getBySpecies(@PathVariable Long animalTypeId) {
        return petService.getByAnimalType(animalTypeId);
    }

    @GetMapping("/by-breed/{breedId}")
    public List<Pet> getByBreed(@PathVariable Long breedId) {
        return petService.getByBreed(breedId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Pet> update(@PathVariable Long id, @RequestBody Pet pet) {
        Pet updated = petService.update(id, pet);
        return ResponseEntity.ok(updated);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
