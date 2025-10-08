package com.iis.PetClinic.controller;


import com.iis.PetClinic.dto.request.AppointmentCreateDTO;
import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;
import com.iis.PetClinic.model.User;
import com.iis.PetClinic.repository.IPetRepository;
import com.iis.PetClinic.repository.IServiceRepository;
import com.iis.PetClinic.repository.IUserRepository;
import com.iis.PetClinic.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.iis.PetClinic.model.UrgencyPriority;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final IAppointmentService apptService;
    private final IUserRepository userRepo;
    private final IPetRepository petRepo;
    private final IServiceRepository serviceRepo; // napravi ako nemaš

    @PostMapping
    public Appointment create(@RequestBody AppointmentCreateDTO dto) {
        var vet = userRepo.findById(dto.getVeterinarianId().intValue()).orElseThrow(); // uskladi tip
        var pet = petRepo.findById(dto.getPetId()).orElseThrow();
        var srv = serviceRepo.findById(dto.getServiceId()).orElseThrow();
        User creator = null;
        if (dto.getCreatedById() != null)
            creator = userRepo.findById(dto.getCreatedById().intValue()).orElse(null);

        var a = new Appointment();
        a.setStartAt(dto.getStartAt());
        a.setEndAt(dto.getEndAt());
        a.setUrgent(dto.isUrgent());
        if (dto.getPriority() != null) a.setPriority(UrgencyPriority.valueOf(dto.getPriority()));
        a.setVeterinarian(vet);
        a.setPet(pet);
        a.setService(srv);
        a.setCreatedBy(creator);
        a.setStatus(AppointmentStatus.SCHEDULED);
        a.setNote(dto.getNote());

        return apptService.create(a);
    }

    @PatchMapping("/{id}/status/{status}")
    public Appointment updateStatus(@PathVariable Long id, @PathVariable String status) {
        return apptService.updateStatus(id, status);
    }
}