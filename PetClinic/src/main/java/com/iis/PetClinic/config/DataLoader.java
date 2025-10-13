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
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final IUserRepository userRepo;
    private final IAnimalTypeRepository animalTypeRepo;
    private final IBreedRepository breedRepo;
    private final IPetRepository petRepo;
    private final IServiceRepository serviceRepo;
    private final IAppointmentRepository apptRepo;

    @Override
    @Transactional
    public void run(String... args) {
        // --- USERS (Veterinar, Staff admin, 2 vlasnika) ---------------------
        User vet = userRepo.findByEmail("vet@clinic.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setFirstName("Dr");
                    u.setLastName("Marković");
                    u.setEmail("vet@clinic.com");
                    u.setPassword("{noop}pass");
                    u.setRole(Role.VETERINARIAN);
                    return userRepo.save(u);
                });

        User staff = userRepo.findByEmail("staff@clinic.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setFirstName("Ana");
                    u.setLastName("Recepcija");
                    u.setEmail("staff@clinic.com");
                    u.setPassword("{noop}pass");
                    u.setRole(Role.STAFF_ADMIN);
                    return userRepo.save(u);
                });

        User owner1 = userRepo.findByEmail("nada@mail.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setFirstName("Nada");
                    u.setLastName("Jovanović");
                    u.setEmail("nada@mail.com");
                    u.setPassword("{noop}pass");
                    u.setRole(Role.USER);
                    return userRepo.save(u);
                });

        User owner2 = userRepo.findByEmail("marko@mail.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setFirstName("Marko");
                    u.setLastName("Petrović");
                    u.setEmail("marko@mail.com");
                    u.setPassword("{noop}pass");
                    u.setRole(Role.USER);
                    return userRepo.save(u);
                });

        // --- ANIMAL TYPE + BREED -------------------------------------------
        AnimalType dog = animalTypeRepo.findByName("Pas")
                .orElseGet(() -> {
                    AnimalType t = new AnimalType();
                    t.setName("Pas");
                    return animalTypeRepo.save(t);
                });

        AnimalType cat = animalTypeRepo.findByName("Mačka")
                .orElseGet(() -> {
                    AnimalType t = new AnimalType();
                    t.setName("Mačka");
                    return animalTypeRepo.save(t);
                });

        Breed labrador = breedRepo.findByName("Labrador")
                .orElseGet(() -> {
                    Breed b = new Breed();
                    b.setName("Labrador");
                    b.setAnimalType(dog);
                    return breedRepo.save(b);
                });

        Breed siam = breedRepo.findByName("Sijamska")
                .orElseGet(() -> {
                    Breed b = new Breed();
                    b.setName("Sijamska");
                    b.setAnimalType(cat);
                    return breedRepo.save(b);
                });

        // --- PETS -----------------------------------------------------------
        Pet maza = petRepo.findByMicrochipNumber("MC-001").orElseGet(() -> {
            Pet p = new Pet();
            p.setName("");
            p.setOwner(owner1);
            p.setAnimaltype(cat);
            p.setBreed(siam);
            p.setBirthDate(LocalDate.of(2022, 5, 20));
            p.setMicrochipNumber("MC-001");
            p.setDescription("Maza (mačka)");
            return petRepo.save(p);
        });

        Pet luna = petRepo.findByMicrochipNumber("MC-002").orElseGet(() -> {
            Pet p = new Pet();
            p.setName("");
            p.setOwner(owner2);
            p.setAnimaltype(dog);
            p.setBreed(labrador);
            p.setBirthDate(LocalDate.of(2021, 3, 10));
            p.setMicrochipNumber("MC-002");
            p.setDescription("Luna (pas)");
            return petRepo.save(p);
        });

        // --- SERVICES (Usluge) ---------------------------------------------
        Service vacc = serviceRepo.findByName("Vakcinacija")
                .orElseGet(() -> {
                    Service s = new Service();
                    s.setName("Vakcinacija");
                    s.setDescription("Redovna vakcinacija ljubimaca");
                    s.setClientType(ClientType.INDIVIDUAL);
                    s.setAnimalType(dog);
                    return serviceRepo.save(s);
                });

        Service diag = serviceRepo.findByName("Dijagnostika")
                .orElseGet(() -> {
                    Service s = new Service();
                    s.setName("Dijagnostika");
                    s.setDescription("Dijagnostički pregled i analiza stanja");
                    s.setClientType(ClientType.INDIVIDUAL);
                    s.setAnimalType(dog);
                    return serviceRepo.save(s);
                });

        Service surgery = serviceRepo.findByName("Hirurgija")
                .orElseGet(() -> {
                    Service s = new Service();
                    s.setName("Hirurgija");
                    s.setDescription("Hirurške intervencije i zahvati");
                    s.setClientType(ClientType.INDIVIDUAL);
                    s.setAnimalType(cat);
                    return serviceRepo.save(s);
                });

        Service control = serviceRepo.findByName("Kontrolni pregled")
                .orElseGet(() -> {
                    Service s = new Service();
                    s.setName("Kontrolni pregled");
                    s.setDescription("Provera stanja nakon tretmana ili terapije");
                    s.setClientType(ClientType.INDIVIDUAL);
                    s.setAnimalType(dog);
                    return serviceRepo.save(s);
                });




        // --- APPOINTMENTS (15.10.2025) -------------------------------------
        LocalDate day = LocalDate.of(2025, 10, 15);

        if (apptRepo.findByStartAtBetweenOrderByStartAt(
                day.atStartOfDay(), day.plusDays(1).atStartOfDay()).isEmpty()) {

            Appointment a1 = new Appointment();
            a1.setStartAt(LocalDateTime.of(2025,10,15,9,0));
            a1.setEndAt  (LocalDateTime.of(2025,10,15,9,30));
            a1.setStatus(AppointmentStatus.SCHEDULED);
            a1.setUrgent(false);
            a1.setVeterinarian(vet);
            a1.setPet(maza);
            a1.setService(vacc);
            a1.setCreatedBy(staff);
            apptRepo.save(a1);

            Appointment a2 = new Appointment();
            a2.setStartAt(LocalDateTime.of(2025,10,15,10,0));
            a2.setEndAt  (LocalDateTime.of(2025,10,15,10,45));
            a2.setStatus(AppointmentStatus.IN_PROGRESS);
            a2.setUrgent(false);
            a2.setVeterinarian(vet);
            a2.setPet(luna);
            a2.setService(diag);
            apptRepo.save(a2);

            Appointment a3 = new Appointment();
            a3.setStartAt(LocalDateTime.of(2025,10,15,11,30));
            a3.setEndAt  (LocalDateTime.of(2025,10,15,12,15));
            a3.setStatus(AppointmentStatus.SCHEDULED);
            a3.setUrgent(true);
            a3.setPriority(UrgencyPriority.H1);
            a3.setVeterinarian(vet);
            a3.setPet(maza);
            a3.setService(surgery);
            a3.setCreatedBy(staff);
            apptRepo.save(a3);

            Appointment a4 = new Appointment();
            a4.setStartAt(LocalDateTime.of(2025,10,15,12,30));
            a4.setEndAt  (LocalDateTime.of(2025,10,15,13,0));
            a4.setStatus(AppointmentStatus.COMPLETED);
            a4.setUrgent(false);
            a4.setVeterinarian(vet);
            a4.setPet(luna);
            a4.setService(control);
            apptRepo.save(a4);
        }
    }
}
