// com/iis/PetClinic/dto/AppointmentResponse.java
package com.iis.PetClinic.dto;

import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.Veterinarian;
import com.iis.PetClinic.model.AppointmentStatus;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        LocalDateTime appointmentDate,
        AppointmentStatus status,
        Long petId,
        String petName,
        Long veterinarianId,
        String veterinarianName
) {
    public static AppointmentResponse of(Appointment a) {
        Veterinarian v = a.getVeterinarian();
        String vetName = (v != null && v.getUser() != null)
                ? ( (v.getUser().getFirstName() != null ? v.getUser().getFirstName() : "")
                + " "
                + (v.getUser().getLastName() != null ? v.getUser().getLastName() : "") ).trim()
                : null;

        return new AppointmentResponse(
                a.getId(),
                a.getAppointmentDate(),
                a.getStatus(),
                a.getPet().getId(),
                a.getPet().getName(),
                v != null ? v.getId() : null,
                vetName != null && !vetName.isBlank() ? vetName : (v != null ? "Veterinar #" + v.getId() : null)
        );
    }
}
