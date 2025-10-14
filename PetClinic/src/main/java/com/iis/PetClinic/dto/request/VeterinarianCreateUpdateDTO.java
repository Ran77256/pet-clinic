package com.iis.PetClinic.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VeterinarianCreateUpdateDTO {

    // Core veterinarian data
    private String specialization;
    private String phoneNumber;

    // --- Link to existing user OR create a new one ---
    // Option A: link to existing user
    private Long userId;

    // Option B: create (or link by) user by email
    private String firstName;
    private String lastName;
    private String email;
    private String password; // required only when creating a new user
}
