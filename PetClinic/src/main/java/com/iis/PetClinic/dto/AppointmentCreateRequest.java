// com/iis/PetClinic/dto/AppointmentCreateRequest.java
package com.iis.PetClinic.dto;

public record AppointmentCreateRequest(
        Long petId,
        String appointmentDate,   // "YYYY-MM-DD"
        String appointmentTime,   // "HH:mm"
        String reason,
        String notes,
         Boolean joinWaitlist,
        Boolean urgent
) {}
