package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.Breed;
import com.iis.PetClinic.repository.IBreedRepository;
import com.iis.PetClinic.service.IBreedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BreedService implements IBreedService {
    @Autowired
    private IBreedRepository  breedRepository;

    @Override
    public Breed addBreed(Breed breed) {
        return breedRepository.save(breed);
    }

    @Override
    public List<Breed> getAllBreeds() {
        return breedRepository.findAll();
    }

    @Override
    public void deleteHealthCondition(Long id) {
        if (breedRepository.existsById(id)) {
            breedRepository.deleteById(id);
        } else {
            throw new RuntimeException("Zdravstveno stanje sa ID " + id + " nije pronađeno.");
        }}
}