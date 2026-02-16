// com/iis/PetClinic/dto/VeterinarianResponse.java
package com.iis.PetClinic.dto;

import com.iis.PetClinic.model.Veterinarian;

public record VeterinarianResponse(
        Long id,
        Integer userId,
        String firstName,
        String lastName,
        String specialization,
        String phoneNumber
) {
    public static VeterinarianResponse of(Veterinarian v) {
        return new VeterinarianResponse(
                v.getId(),
                v.getUser() != null ? v.getUser().getId() : null,
                v.getUser() != null ? v.getUser().getFirstName() : null,
                v.getUser() != null ? v.getUser().getLastName() : null,
                v.getSpecialization(),
                v.getPhoneNumber()
        );
    }
}
