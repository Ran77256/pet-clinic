// src/main/java/com/iis/PetClinic/config/DataLoader.java
package com.iis.PetClinic.config;

import com.iis.PetClinic.model.*;
import com.iis.PetClinic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final IUserRepository userRepo;
    private final IVeterinarianRepository vetRepo;
    private final IAnimalTypeRepository animalTypeRepo;
    private final IBreedRepository breedRepo;
    private final IPetRepository petRepo;

    // NOVO: repo za termine
    private final IAppointmentRepository apptRepo;

    @Override
    @Transactional
    public void run(String... args) {
        // --- 1) USERS ------------------------------------------------------
        User owner = userRepo.findByEmail("owner@mail.com").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Nada");
            u.setLastName("Jovanović");
            u.setEmail("owner@mail.com");
            u.setPassword("{noop}pass"); // demo
            u.setRole(Role.USER);
            return userRepo.save(u);
        });

        // Veterinar -> User
        User vetUser = userRepo.findByEmail("vet@clinic.com").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Dr");
            u.setLastName("Marković");
            u.setEmail("vet@clinic.com");
            u.setPassword("{noop}pass");
            u.setRole(Role.VETERINARIAN);
            return userRepo.save(u);
        });

        // --- 2) VETERINARIAN ----------------------------------------------
        Veterinarian vet = vetRepo.findByUser_Id(vetUser.getId())
                .orElseGet(() -> {
                    Veterinarian v = new Veterinarian();
                    v.setUser(vetUser);
                    v.setSpecialization("opšta praksa");
                    v.setPhoneNumber("+381 60 111 222");
                    return vetRepo.save(v);
                });

        // Veterinar -> User
        User vetUser2 = userRepo.findByEmail("vet1@clinic.com").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Dr");
            u.setLastName("Petković");
            u.setEmail("vet1@clinic.com");
            u.setPassword("{noop}pass");
            u.setRole(Role.VETERINARIAN);
            return userRepo.save(u);
        });

        // --- 2) VETERINARIAN ----------------------------------------------
        Veterinarian vet2 = vetRepo.findByUser_Id(vetUser2.getId())
                .orElseGet(() -> {
                    Veterinarian v = new Veterinarian();
                    v.setUser(vetUser2);
                    v.setSpecialization("opšta praksa");
                    v.setPhoneNumber("+381 60 111 222");
                    return vetRepo.save(v);
                });

        // --- 3) ŠIFRARNICI -------------------------------------------------
        AnimalType dog = animalTypeRepo.findByName("Pas").orElseGet(() -> {
            AnimalType t = new AnimalType();
            t.setName("Pas");
            return animalTypeRepo.save(t);
        });

        AnimalType cat = animalTypeRepo.findByName("Mačka").orElseGet(() -> {
            AnimalType t = new AnimalType();
            t.setName("Mačka");
            return animalTypeRepo.save(t);
        });

        Breed labrador = breedRepo.findByName("Labrador").orElseGet(() -> {
            Breed b = new Breed();
            b.setName("Labrador");
            b.setAnimalType(dog);
            return breedRepo.save(b);
        });

        Breed siam = breedRepo.findByName("Sijamska").orElseGet(() -> {
            Breed b = new Breed();
            b.setName("Sijamska");
            b.setAnimalType(cat);
            return breedRepo.save(b);
        });

        // --- 4) PETS (Ljubimci) -------------------------------------------
        Pet maza = petRepo.findByMicrochipNumber("MC-001").orElseGet(() -> {
            Pet p = new Pet();
            p.setName("Maza");
            p.setBirthDate(LocalDate.of(2022, 5, 20));
            p.setMicrochipNumber("MC-001");
            p.setDescription("Maza (mačka)");
            p.setOwner(owner);
            p.setAnimaltype(cat);
            p.setBreed(siam);
            p.setVeterinarian(vet); // dodeljen isti vet
            return petRepo.save(p);
        });

        Pet luna = petRepo.findByMicrochipNumber("MC-002").orElseGet(() -> {
            Pet p = new Pet();
            p.setName("Luna");
            p.setBirthDate(LocalDate.of(2021, 3, 10));
            p.setMicrochipNumber("MC-002");
            p.setDescription("Luna (pas)");
            p.setOwner(owner);
            p.setAnimaltype(dog);
            p.setBreed(labrador);
            p.setVeterinarian(vet); // dodeljen isti vet
            return petRepo.save(p);
        });

        // --- 5) APPOINTMENTS (za ovog jednog doktora) ----------------------
        // Napravi raznovrsne termine: prošli, današnji, budući + različiti statusi
        LocalDate today = LocalDate.now();

        // Maza
        seedAppt(maza, vet, today.minusDays(7),  9, 30, "Vakcinacija",       "redovna",            AppointmentStatus.COMPLETED);
        seedAppt(maza, vet, today.minusDays(2), 11,  0, "Kontrolni pregled", "posle vakcine",      AppointmentStatus.CANCELLED);
        seedAppt(maza, vet, today,             13, 30, "Dijagnostika",      "krvna slika",        AppointmentStatus.COMPLETED);
        seedAppt(maza, vet, today.plusDays(3), 10,  0, "Higijena",          "kupanje",            AppointmentStatus.SCHEDULED);

        // Luna
        seedAppt(luna, vet, today.minusDays(10),  8, 45, "Dijagnostika",     "RTG kukova",         AppointmentStatus.COMPLETED);
        seedAppt(luna, vet, today.minusDays(1),  15,  0, "Kontrolni pregled","kontrola terapije",  AppointmentStatus.COMPLETED);
        seedAppt(luna, vet, today.plusDays(1),   9, 15, "Čipovanje",         "prvo čipovanje",     AppointmentStatus.SCHEDULED);
        seedAppt(luna, vet, today.plusDays(5),  12, 30, "Skidanje kamenca",  "stomatologija",      AppointmentStatus.SCHEDULED);
    }

    // ===================== HELPERS =====================

    private void seedAppt(Pet pet, Veterinarian vet, LocalDate day, int hour, int minute,
                          String reason, String notes, AppointmentStatus status) {

        LocalDateTime start = LocalDateTime.of(day, LocalTime.of(hour, minute));

        // izbegni duplikat istog slota
        if (apptRepo.existsByPet_IdAndAppointmentDate(pet.getId(), start)) return;

        Appointment a = new Appointment();
        a.setPet(pet);
        // Ako Appointment entitet ima polje "veterinarian" (što imaš, jer ga setuješ u controlleru):
        a.setVeterinarian(vet);
        a.setAppointmentDate(start);
        a.setStatus(status);
        a.setReason(reason);
        a.setNotes(notes);
        apptRepo.save(a);
    }
}
