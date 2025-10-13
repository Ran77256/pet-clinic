package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.exception.NotFoundException;
import com.iis.PetClinic.model.Pet;
import com.iis.PetClinic.model.Veterinarian;
import com.iis.PetClinic.repository.IPetRepository;
import com.iis.PetClinic.repository.IVeterinarianRepository;
import com.iis.PetClinic.service.IPetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class PetServiceImpl implements IPetService {

    private final IPetRepository petRepository;
    private final IVeterinarianRepository veterinarianRepository;

    public PetServiceImpl(IPetRepository petRepository, IVeterinarianRepository veterinarianRepository) {
        this.petRepository = petRepository;
        this.veterinarianRepository = veterinarianRepository;
    }

    @Override
    public Pet create(Pet pet) {
        // Ako imaš jedinstven mikrocip, možeš ovde dodati check da ne duplira
        return petRepository.save(pet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getAll() {
        return petRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Pet> getById(Long id) {
        return petRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Pet> getByMicrochip(String microchipNumber) {
        return petRepository.findByMicrochipNumber(microchipNumber);
    }

    @Override
    public Pet update(Long id, Pet updated) {
        Pet existing = petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Pet not found: " + id));

        // Osnovna polja
        existing.setBirthDate(updated.getBirthDate());
        existing.setMicrochipNumber(updated.getMicrochipNumber());
        existing.setDescription(updated.getDescription());

        // Reference
        existing.setOwner(updated.getOwner());
        existing.setAnimaltype(updated.getAnimaltype());
        existing.setBreed(updated.getBreed());

        // Kolekcije
        existing.setHealthConditions(updated.getHealthConditions());
        existing.setAppointments(updated.getAppointments());

        return petRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!petRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Pet not found: " + id);
        }
        petRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getByOwner(Long ownerId) {
        return petRepository.findAllByOwner_Id(ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getByAnimalType(Long animalTypeId) {
        return petRepository.findAllByAnimaltype_Id(animalTypeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Pet> getByBreed(Long breedId) {
        return petRepository.findAllByBreed_Id(breedId);
    }
    @Override
    @Transactional
    public void assignVeterinarian(Long petId, Long vetId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new NotFoundException("Pet not found: " + petId));

        Veterinarian vet = veterinarianRepository.findById(vetId)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found: " + vetId));

        pet.setVeterinarian(vet);
        petRepository.save(pet); // nije nužno u transakciji, ali ok je ostaviti
    }

}
