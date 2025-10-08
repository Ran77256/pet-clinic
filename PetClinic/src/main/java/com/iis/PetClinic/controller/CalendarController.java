package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.request.AppointmentSummaryDTO;
import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendars")
public class CalendarController {

    private final IAppointmentService service;

    // dnevni (svi)
// CalendarController.java
    // helper za mapiranje
    private AppointmentSummaryDTO map(Appointment a) {
        var vet = a.getVeterinarian();
        var pet = a.getPet();
        var srv = a.getService();
        return new AppointmentSummaryDTO(
                a.getId(),
                a.getStartAt(),
                a.getEndAt(),
                a.getStatus().name(),
                a.isUrgent(),
                vet.getId(),
                (vet.getFirstName() != null ? vet.getFirstName() + " " : "") +
                        (vet.getLastName() != null ? vet.getLastName() : ""),
                pet.getId(),
                pet.getDescription() != null ? pet.getDescription() : ("Pet#" + pet.getId()),
                srv.getId(),
                srv.getName()
        );
    }

    // Dnevni pregled
    @GetMapping("/day")
    public List<AppointmentSummaryDTO> byDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.day(date).stream().map(this::map).toList();
    }

    //  Pregled po veterinaru
    @GetMapping("/veterinarians/{vetId}/day")
    public List<AppointmentSummaryDTO> byVet(
            @PathVariable Integer vetId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.dayForVet(vetId, date).stream().map(this::map).toList();
    }

    // Pregled po pacijentu
    @GetMapping("/patients/{petId}/appointments")
    public List<AppointmentSummaryDTO> byPet(@PathVariable Long petId) {
        return service.forPet(petId).stream().map(this::map).toList();
    }
}