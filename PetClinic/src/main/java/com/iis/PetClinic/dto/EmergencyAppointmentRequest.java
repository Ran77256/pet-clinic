package com.iis.PetClinic.dto;

public record EmergencyAppointmentRequest(
        Long petId,
        String appointmentDate,   // "YYYY-MM-DD"
        String appointmentTime,   // "HH:mm"
        String reason,
        String notes,
        Long veterinarianId
) {}
