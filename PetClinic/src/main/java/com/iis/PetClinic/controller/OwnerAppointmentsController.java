// com/iis/PetClinic/controller/OwnerAppointmentsController.java
package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.AppointmentResponse;
import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;
import com.iis.PetClinic.repository.IAppointmentRepository;
import com.iis.PetClinic.service.impl.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/owner-appointments")
public class OwnerAppointmentsController {

    private final IAppointmentRepository apptRepo;
    private final WaitlistService waitlistService;

    // GET /api/owner-appointments/{ownerId}?status=ALL|SCHEDULED|CANCELLED|COMPLETED
    @GetMapping("/{ownerId}")
    public ResponseEntity<List<AppointmentResponse>> listByOwner(
            @PathVariable Integer ownerId,
            @RequestParam(defaultValue = "SCHEDULED") String status
    ) {
        List<Appointment> list = "ALL".equalsIgnoreCase(status)
                ? apptRepo.findByPet_Owner_IdOrderByAppointmentDateDesc(ownerId)
                : apptRepo.findByPet_Owner_IdAndStatusOrderByAppointmentDateDesc(
                ownerId, AppointmentStatus.valueOf(status.toUpperCase()));

        return ResponseEntity.ok(list.stream().map(AppointmentResponse::of).toList());
    }

    // PATCH /api/owner-appointments/{appointmentId}/cancel
//    @PatchMapping("/{appointmentId}/cancel")
//    public ResponseEntity<AppointmentResponse> cancel(@PathVariable Long appointmentId) {
//        Appointment a = apptRepo.findById(appointmentId)
//                .orElseThrow(() -> new IllegalArgumentException("Termin ne postoji: " + appointmentId));
//        a.setStatus(AppointmentStatus.CANCELLED);
//        a = apptRepo.save(a);
//        return ResponseEntity.ok(AppointmentResponse.of(a));
//    }

    // com/iis/PetClinic/controller/OwnerAppointmentsController.java

    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponse> cancel(@PathVariable Long appointmentId) {
        Appointment a = apptRepo.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Termin ne postoji: " + appointmentId));

        a.setStatus(AppointmentStatus.CANCELLED);


        a = apptRepo.saveAndFlush(a);

        if (a.getVeterinarian() != null) {
            waitlistService.promoteFirstIfAny(a.getVeterinarian().getId(), a.getAppointmentDate());
        }

        return ResponseEntity.ok(AppointmentResponse.of(a));
    }



}
