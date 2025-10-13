package com.iis.PetClinic.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VeterinarianResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String specialization;
    private String phoneNumber;
    private String email;
    private long petsCount; // korisno za list prikaz
}
