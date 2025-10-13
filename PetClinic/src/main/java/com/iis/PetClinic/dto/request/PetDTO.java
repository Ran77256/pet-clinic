package com.iis.PetClinic.dto.request;

import com.iis.PetClinic.model.HealthCondition;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetDTO {

    private Long id;
    private String name;
    private LocalDate birthDate;
    private String microchipNumber;

    private Long ownerId;
    private String breedName;
    private String animalTypeName;

    private List<HealthCondition> healthConditions;
    private Long veterinarianId;
}
