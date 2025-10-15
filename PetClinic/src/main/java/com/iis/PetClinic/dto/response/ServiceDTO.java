package com.iis.PetClinic.dto.response;

import lombok.*;
import java.math.BigDecimal;

/**
 * DTO klasa za prenos podataka o uslugama (Service) ka frontendu.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDTO {
    private Long id;
    private String name;
    private String description;
    private String clientType;   // String jer se Enum pretvara u tekst
    private Long animalTypeId;
    private String animalTypeName;
}
