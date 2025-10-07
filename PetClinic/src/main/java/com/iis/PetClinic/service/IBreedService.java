package com.iis.PetClinic.service;

import com.iis.PetClinic.model.Breed;

import java.util.List;

public interface IBreedService {
    Breed addBreed(Breed breed);

    List<Breed> getAllBreeds();

    void deleteHealthCondition(Long id);
}
