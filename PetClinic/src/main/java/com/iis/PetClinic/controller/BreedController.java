package com.iis.PetClinic.controller;

import com.iis.PetClinic.model.Breed;
import com.iis.PetClinic.service.IBreedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/breeds")
public class BreedController {
    @Autowired
    private IBreedService  breedService;

    @PostMapping(
            value = "/add",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public Breed addBreed(@RequestBody Breed breed) {
        return breedService.addBreed(breed);
    }

    @GetMapping
    @RequestMapping("/all")
    public List<Breed> getAllBreeds() {
        return breedService.getAllBreeds();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteHealthCondition(@PathVariable Long id) {
        breedService.deleteHealthCondition(id);
    }

}