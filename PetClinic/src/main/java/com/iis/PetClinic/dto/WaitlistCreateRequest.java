package com.iis.PetClinic.dto;

import java.time.LocalDateTime;

public record WaitlistCreateRequest(
        Long petId,
        Long veterinarianId,
        String appointmentDate,  // ISO date: 2025-10-17
        String appointmentTime,  // HH:mm
        String note
) {}