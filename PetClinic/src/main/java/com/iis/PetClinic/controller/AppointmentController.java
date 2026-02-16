
package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.AppointmentCreateRequest;
import com.iis.PetClinic.dto.AppointmentResponse;
import com.iis.PetClinic.dto.WaitlistCreateRequest;
import com.iis.PetClinic.dto.WaitlistResponse;
import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;
import com.iis.PetClinic.model.Pet;
import com.iis.PetClinic.model.Veterinarian;
import com.iis.PetClinic.repository.IAppointmentRepository;
import com.iis.PetClinic.repository.IPetRepository;
import com.iis.PetClinic.service.impl.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.iis.PetClinic.model.AppointmentStatus.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin
@RequiredArgsConstructor
public class AppointmentController {

    private final IPetRepository petRepo;
    private final IAppointmentRepository apptRepo;

    private final WaitlistService waitlistService;
//
//    @PostMapping(consumes = "application/json", produces = "application/json")
//    public ResponseEntity<AppointmentResponse> create(@RequestBody AppointmentCreateRequest req) {
//        if (req.petId() == null || req.appointmentDate() == null || req.appointmentTime() == null) {
//            return ResponseEntity.badRequest().build();
//        }
//
//        // Parsiranje datuma i vremena
//        LocalDate date = LocalDate.parse(req.appointmentDate());
//        LocalTime time = LocalTime.parse(req.appointmentTime());
//        LocalDateTime start = LocalDateTime.of(date, time);
//
//        // Validacija ljubimca
//        Pet pet = petRepo.findById(req.petId())
//                .orElseThrow(() -> new IllegalArgumentException("Ljubimac ne postoji: " + req.petId()));
//
//        // Anti-dup check: isti ljubimac & isti slot
//        if (apptRepo.existsByPet_IdAndAppointmentDate(pet.getId(), start)) {
//            throw new IllegalStateException("Termin za ovog ljubimca u izabranom terminu već postoji.");
//        }
//
//        Appointment a = new Appointment();
//        a.setPet(pet);
//        a.setVeterinarian(pet.getVeterinarian());
//        a.setAppointmentDate(start);
//        a.setStatus(AppointmentStatus.SCHEDULED);
//        a.setReason(req.reason());
//        a.setNotes(req.notes());
//
//        a = apptRepo.save(a);
//        return ResponseEntity.ok(AppointmentResponse.of(a));
//    }

    /**
     * Dinamičko zakazivanje:
     * - Ako je slot slobodan za datog veterinara -> kreiraj termin
     * - Ako je zauzet:
     *   - ako joinWaitlist=true -> dodaj na čekanje (202 Accepted + WaitlistResponse u body)
     *   - inače 409 Conflict sa porukom
     */
    @PostMapping(consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> create(@RequestBody AppointmentCreateRequest req) {
        if (req.petId() == null || req.appointmentDate() == null || req.appointmentTime() == null) {
            return ResponseEntity.badRequest().body("Nedostaju obavezna polja.");
        }

        final boolean isUrgent = Boolean.TRUE.equals(req.urgent());

        LocalDate date = LocalDate.parse(req.appointmentDate());
        LocalTime time = LocalTime.parse(req.appointmentTime());
        LocalDateTime start = LocalDateTime.of(date, time);

        Pet pet = petRepo.findById(req.petId())
                .orElseThrow(() -> new IllegalArgumentException("Ljubimac ne postoji: " + req.petId()));

        Veterinarian vet = pet.getVeterinarian();
        if (vet == null) {
            return ResponseEntity.badRequest().body("Ljubimac nema dodeljenog veterinara.");
        }

        // isti ljubimac u istom slotu – i dalje zabranjujemo
        if (apptRepo.existsByPet_IdAndAppointmentDate(pet.getId(), start)) {
            return ResponseEntity.status(409).body("Ovaj ljubimac već ima termin u tom slotu.");
        }

        // ZA OBIČAN TERMIN: blokira ako vet ima SCHEDULED ili IN_PROGRESS u istom slotu
        if (!isUrgent) {

            boolean vetBusy = apptRepo.existsByVeterinarian_IdAndAppointmentDateAndStatusIn(
                    vet.getId(),
                    start,
                    java.util.List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.EMERGENCY) // ← DODATO
            );

            if (vetBusy) {
                if (Boolean.TRUE.equals(req.joinWaitlist())) {
                    WaitlistResponse w = waitlistService.add(new WaitlistCreateRequest(
                            pet.getId(),
                            vet.getId(),
                            req.appointmentDate(),
                            req.appointmentTime(),
                            req.reason() != null ? ("[Željeni termin] " + req.reason()) : "[Željeni termin]"
                    ));
                    return ResponseEntity.accepted().body(w); // 202 Accepted
                }
                return ResponseEntity.status(409).body("Termin je zauzet. Možemo vas staviti na listu čekanja.");
            }
        }
        // ZA URGENT: dozvoli preklapanje (bez vetBusy provere)

        Appointment a = new Appointment();
        a.setPet(pet);
        a.setVeterinarian(vet);
        a.setAppointmentDate(start);
        a.setStatus(isUrgent ? EMERGENCY : SCHEDULED); // ← ključna linija
        a.setReason(isUrgent
                ? (req.reason() != null ? "HITNO — " + req.reason() : "HITNO")
                : req.reason());
        a.setNotes(req.notes());
        try {
            // ako tvoj entitet ima polje urgent (boolean)
            Appointment.class.getMethod("setUrgent", boolean.class); // refleksija da ne puca ako nema polje
            a.getClass().getMethod("setUrgent", boolean.class).invoke(a, isUrgent);
        } catch (Exception ignored) { /* nema polje – sve ok */ }

        a = apptRepo.save(a);
        return ResponseEntity.ok(AppointmentResponse.of(a));
    }



}
