package com.iis.PetClinic.service.impl;


import com.iis.PetClinic.dto.WaitlistCreateRequest;
import com.iis.PetClinic.dto.WaitlistResponse;
import com.iis.PetClinic.model.*;
import com.iis.PetClinic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitlistService {

    private final IPetRepository petRepo;
    private final IVeterinarianRepository vetRepo;
    private final IWaitlistRepository waitRepo;
    private final IAppointmentRepository apptRepo;

    @Transactional
    public WaitlistResponse add(WaitlistCreateRequest req) {
        if (req.petId() == null || req.veterinarianId() == null || req.appointmentDate() == null || req.appointmentTime() == null)
            throw new IllegalArgumentException("Nedostaju obavezna polja.");

        LocalDate date = LocalDate.parse(req.appointmentDate());
        LocalTime time = LocalTime.parse(req.appointmentTime());
        LocalDateTime start = LocalDateTime.of(date, time);

        Pet pet = petRepo.findById(req.petId())
                .orElseThrow(() -> new IllegalArgumentException("Ljubimac ne postoji: " + req.petId()));
        Veterinarian vet = vetRepo.findById(req.veterinarianId())
                .orElseThrow(() -> new IllegalArgumentException("Veterinar ne postoji: " + req.veterinarianId()));

        if (waitRepo.existsByPet_IdAndDesiredStartAndActive(pet.getId(), start, true))
            throw new IllegalStateException("Već ste na listi čekanja za ovaj termin.");

        WaitlistEntry w = WaitlistEntry.builder()
                .pet(pet)
                .veterinarian(vet)
                .desiredStart(start)
                .note(req.note())
                .active(true)
                .build();
        w = waitRepo.save(w);

        return toDto(w);
    }

    @Transactional(readOnly = true)
    public List<WaitlistResponse> list(Long vetId, LocalDate from, LocalDate to, Boolean onlyActive) {
        boolean active = onlyActive == null || onlyActive;
        if (vetId == null && from == null && to == null) {
            return waitRepo.findByActiveTrueOrderByDesiredStartAscCreatedAtAsc()
                    .stream().map(this::toDto).toList();
        }
        if (from != null && to != null && vetId != null) {
            return waitRepo.findByVeterinarian_IdAndDesiredStartBetweenAndActiveOrderByDesiredStartAscCreatedAtAsc(
                            vetId, from.atStartOfDay(), to.atTime(LocalTime.MAX), active)
                    .stream().map(this::toDto).toList();
        }
        if (vetId != null) {
            return waitRepo.findByVeterinarian_IdAndActiveOrderByDesiredStartAscCreatedAtAsc(vetId, active)
                    .stream().map(this::toDto).toList();
        }
        // fallback
        return waitRepo.findByActiveTrueOrderByDesiredStartAscCreatedAtAsc()
                .stream().map(this::toDto).toList();
    }

    /** Pozvati na otkazivanje termina: promoviši prvog sa liste. */
    // com/iis/PetClinic/service/impl/WaitlistService.java

    @Transactional
    public Appointment promoteFirstIfAny(Long veterinarianId, LocalDateTime start) {
        // ✅ proveri zauzetost samo protiv aktivnih statusa
        boolean busy = apptRepo.existsByVeterinarian_IdAndAppointmentDateAndStatusIn(
                veterinarianId, start, List.of(AppointmentStatus.SCHEDULED)
        );
        if (busy) return null;

        var next = waitRepo.findFirstByVeterinarian_IdAndDesiredStartAndActiveOrderByCreatedAtAsc(
                veterinarianId, start, true
        );
        if (next.isEmpty()) return null;

        WaitlistEntry w = next.get();

        Appointment a = new Appointment();
        a.setPet(w.getPet());
        a.setVeterinarian(w.getVeterinarian());
        a.setAppointmentDate(start);
        a.setStatus(AppointmentStatus.SCHEDULED);
        a.setReason("Automatski sa liste čekanja");
        a.setNotes(w.getNote());
        a = apptRepo.save(a);

        w.setActive(false);
        waitRepo.save(w);

        return a;
    }


    private WaitlistResponse toDto(WaitlistEntry w) {
        String vetName = w.getVeterinarian().getUser() != null
                ? ( (w.getVeterinarian().getUser().getFirstName() != null ? w.getVeterinarian().getUser().getFirstName() : "")
                + " " +
                (w.getVeterinarian().getUser().getLastName()  != null ? w.getVeterinarian().getUser().getLastName()  : "") ).trim()
                : "Vet #" + w.getVeterinarian().getId();

        return new WaitlistResponse(
                w.getId(),
                w.getPet().getId(),
                w.getPet().getName(),
                w.getVeterinarian().getId(),
                vetName,
                w.getDesiredStart(),
                w.getNote(),
                w.isActive(),
                w.getCreatedAt()
        );
    }
}