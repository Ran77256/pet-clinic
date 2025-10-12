package com.iis.PetClinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ItemResponse {
    private int id;
    private String name;
    private int minQuantity;
    private int stockLevel;
    private String packaging;
}
