// com/iis/PetClinic/controller/VetAppointmentsController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.VetAppointmentResponse;
import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;
import com.iis.PetClinic.repository.IAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vet-appointments")
@CrossOrigin(origins = "http://localhost:3001") // frontend na 3001
public class VetAppointmentsController {

    private final IAppointmentRepository apptRepo;

    // GET /api/vet-appointments/{vetId}?date=2025-10-15&status=ALL
    @GetMapping("/{vetId}")
    public ResponseEntity<List<VetAppointmentResponse>> listForDay(
            @PathVariable Long vetId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "ALL") String status
    ) {
        LocalDate target = (date != null) ? date : LocalDate.now();
        LocalDateTime start = target.atStartOfDay();
        LocalDateTime end   = target.plusDays(1).atStartOfDay();

        List<Appointment> list;
        if (!"ALL".equalsIgnoreCase(status)) {
            AppointmentStatus st = AppointmentStatus.valueOf(status.toUpperCase());
            list = apptRepo.findByVeterinarian_IdAndStatusAndAppointmentDateBetweenOrderByAppointmentDateAsc(
                    vetId, st, start, end);
        } else {
            list = apptRepo.findByVeterinarian_IdAndAppointmentDateBetweenOrderByAppointmentDateAsc(
                    vetId, start, end);
        }

        return ResponseEntity.ok(list.stream().map(VetAppointmentResponse::of).toList());
    }
}
