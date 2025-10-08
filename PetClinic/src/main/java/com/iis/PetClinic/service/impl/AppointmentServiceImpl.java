package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;
import com.iis.PetClinic.repository.IAppointmentRepository;
import com.iis.PetClinic.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final IAppointmentRepository repo;

    @Override
    public Appointment create(Appointment a) {
        // blokiraj preklapanje samo ako NIJE urgent
        if (!a.isUrgent() && !repo.checkOverlap(
                a.getVeterinarian().getId(),
                a.getStartAt(), a.getEndAt()).isEmpty()) {
            throw new IllegalStateException("Termin u koliziji sa postojećim.");
        }
        if (a.getStatus() == null) a.setStatus(AppointmentStatus.SCHEDULED);
        return repo.save(a);
    }

    @Override
    public List<Appointment> day(LocalDate date) {
        var from = date.atStartOfDay();
        var to   = date.plusDays(1).atStartOfDay();
        return repo.findByStartAtBetweenOrderByStartAt(from, to);
    }

    @Override
    public List<Appointment> dayForVet(Integer vetId, LocalDate d) {
        var from = d.atStartOfDay();
        var to   = d.plusDays(1).atStartOfDay();
        return repo.findByVeterinarian_IdAndStartAtBetweenOrderByStartAt(vetId, from, to);
    }

    @Override
    public List<Appointment> forPet(Long petId) {
        return repo.findByPet_IdOrderByStartAtDesc(petId);
    }

    @Override
    public Appointment updateStatus(Long id, String status) {
        var a = repo.findById(id).orElseThrow();
        a.setStatus(AppointmentStatus.valueOf(status));
        return a; // @Transactional će flush-ovati
    }
}