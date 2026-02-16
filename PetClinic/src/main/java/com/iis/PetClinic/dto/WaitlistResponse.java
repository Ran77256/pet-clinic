package com.iis.PetClinic.dto;

import java.time.LocalDateTime;

public record WaitlistResponse(
        Long id,
        Long petId,
        String petName,
        Long veterinarianId,
        String veterinarianName,
        LocalDateTime desiredStart,
        String note,
        boolean active,
        LocalDateTime createdAt
) {}