// com/iis/PetClinic/controller/EmergencyAppointmentController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.EmergencyAppointmentRequest;
import com.iis.PetClinic.dto.AppointmentResponse;
import com.iis.PetClinic.model.*;
import com.iis.PetClinic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.*;

@RestController
@RequestMapping("/api/emergency-appointments")
@RequiredArgsConstructor
@CrossOrigin
public class EmergencyAppointmentController {

    private final IPetRepository petRepo;
    private final IVeterinarianRepository vetRepo;
    private final IAppointmentRepository apptRepo;

    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<AppointmentResponse> create(@RequestBody EmergencyAppointmentRequest req) {
        if (req.petId() == null || req.appointmentDate() == null || req.appointmentTime() == null) {
            return ResponseEntity.badRequest().build();
        }

        LocalDate date = LocalDate.parse(req.appointmentDate());
        LocalTime time = LocalTime.parse(req.appointmentTime());
        LocalDateTime start = LocalDateTime.of(date, time);
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        Pet pet = petRepo.findById(req.petId())
                .orElseThrow(() -> new IllegalArgumentException("Ljubimac ne postoji: " + req.petId()));

        // izaberi veterinara: -> najmanje zauzet
        Veterinarian vet = (req.veterinarianId() != null)
                ? vetRepo.findById(req.veterinarianId())
                .orElseThrow(() -> new IllegalArgumentException("Veterinar ne postoji: " + req.veterinarianId()))
                : (pet.getVeterinarian() != null
                ? pet.getVeterinarian()
                : vetRepo.findAll().stream()
                .min((a, b) -> Long.compare(
                        apptRepo.countByVeterinarian_IdAndAppointmentDateBetween(a.getId(), dayStart, dayEnd),
                        apptRepo.countByVeterinarian_IdAndAppointmentDateBetween(b.getId(), dayStart, dayEnd)))
                .orElseThrow(() -> new IllegalStateException("Nema dostupnih veterinara.")));

        // dozvoljeno preklapanje
        Appointment a = new Appointment();
        a.setPet(pet);
        a.setVeterinarian(vet);
        a.setAppointmentDate(start);
        a.setStatus(AppointmentStatus.EMERGENCY); // ← KLJUČNO
        a.setReason(req.reason() != null ? "HITNO — " + req.reason() : "Hitan termin");
        a.setNotes(req.notes());
        try { a.getClass().getMethod("setUrgent", boolean.class).invoke(a, true); } catch (Exception ignored) {}

        a = apptRepo.save(a);
        return ResponseEntity.ok(AppointmentResponse.of(a));
    }
}
