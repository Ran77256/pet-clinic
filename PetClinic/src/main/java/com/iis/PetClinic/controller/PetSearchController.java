package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.AppointmentResponse;
import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;
import com.iis.PetClinic.model.Pet;
import com.iis.PetClinic.repository.IAppointmentRepository;
import com.iis.PetClinic.repository.IPetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pets")
@CrossOrigin
public class PetSearchController {

    private final IPetRepository petRepo;
    private final IAppointmentRepository apptRepo;

    // GET /api/pets/search?q=luna&limit=50
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {

        List<Pet> pets = petRepo.searchPetsPg(q, limit);



        return ResponseEntity.ok(
                pets.stream().map(p -> Map.of(
                        "id", p.getId(),
                        "name", p.getName(),
                        "microchipNumber", p.getMicrochipNumber(),
                        "animalType", p.getAnimaltype() != null ? Map.of("name", p.getAnimaltype().getName()) : null,
                        "owner", p.getOwner() != null ? Map.of(
                                "id", p.getOwner().getId(),
                                "firstName", p.getOwner().getFirstName(),
                                "lastName", p.getOwner().getLastName(),
                                "email", p.getOwner().getEmail()
                        ) : null
                )).toList()
        );
    }

    // GET /api/pets/{petId}/appointments?status=ALL|SCHEDULED|CANCELLED|COMPLETED|IN_PROGRESS

    @GetMapping("/appointments/{petId}")
    public ResponseEntity<List<AppointmentResponse>> petAppointments(
            @PathVariable Long petId,
            @RequestParam(required = false, defaultValue = "ALL") String status
    ) {
        List<Appointment> list = "ALL".equalsIgnoreCase(status)
                ? apptRepo.findByPet_IdOrderByAppointmentDateDesc(petId)
                : apptRepo.findByPet_IdAndStatusOrderByAppointmentDateDesc(
                petId, AppointmentStatus.valueOf(status.toUpperCase()));

        return ResponseEntity.ok(list.stream().map(AppointmentResponse::of).toList());
    }
}
