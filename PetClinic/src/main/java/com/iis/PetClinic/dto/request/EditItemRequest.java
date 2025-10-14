package com.iis.PetClinic.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditItemRequest {
    private int id;
    private String name;
    private int minQuantity;
}
