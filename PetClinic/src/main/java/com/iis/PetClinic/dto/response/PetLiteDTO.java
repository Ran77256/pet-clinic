package com.iis.PetClinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PetLiteDTO {
    private Long id;
    private String label;      // prikaz u dropdownu (ime ili opis)
    private String ownerName;  // npr. "Nada Jovanović"
}
