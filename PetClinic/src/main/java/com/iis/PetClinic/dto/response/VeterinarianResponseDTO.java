package com.iis.PetClinic.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VeterinarianResponseDTO {
    private Long id;
    private String specialization;
    private String phoneNumber;

    // user snapshot (pulled from linked User)
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;

    private long petsCount;
}
