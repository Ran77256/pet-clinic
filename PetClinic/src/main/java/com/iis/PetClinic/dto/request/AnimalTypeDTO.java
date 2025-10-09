
package com.iis.PetClinic.dto.request;

import java.util.List;

public record AnimalTypeDTO(Long id, String name, List<BreedDTO> breeds) {}
