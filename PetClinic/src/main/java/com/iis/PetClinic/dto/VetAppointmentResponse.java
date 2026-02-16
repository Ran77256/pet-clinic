// com/iis/PetClinic/dto/VetAppointmentResponse.java
package com.iis.PetClinic.dto;

import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;

import java.time.LocalDateTime;

public record VetAppointmentResponse(
        Long id,
        LocalDateTime appointmentDate,
        AppointmentStatus status,
        Long petId,
        String petName,
        Integer ownerId,
        String ownerName,
        String reason,
        String notes
        // opcionalno: Integer durationMinutes
) {
    public static VetAppointmentResponse of(Appointment a) {
        var pet = a.getPet();
        var owner = pet != null ? pet.getOwner() : null;
        String ownerFull = owner == null ? null :
                ((owner.getFirstName() != null ? owner.getFirstName() : "") + " " +
                        (owner.getLastName()  != null ? owner.getLastName()  : "")).trim();

        return new VetAppointmentResponse(
                a.getId(),
                a.getAppointmentDate(),
                a.getStatus(),
                pet != null ? pet.getId() : null,
                pet != null ? pet.getName() : null,
                owner != null ? owner.getId() : null,
                ownerFull != null && !ownerFull.isBlank() ? ownerFull : null,
                a.getReason(),
                a.getNotes()
        );
    }
}
