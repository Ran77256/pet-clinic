package com.iis.PetClinic.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateItemRequest {
    private String name;
    private String packaging;
    private Integer minQuantity;
    private Integer categoryId;
}
