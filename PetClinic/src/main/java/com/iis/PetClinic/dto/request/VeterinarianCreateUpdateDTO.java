package com.iis.PetClinic.dto.request;


import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VeterinarianCreateUpdateDTO {


    private String firstName;


    private String lastName;

    private String specialization;
    private String phoneNumber;


    private String email;
}
