package com.iis.PetClinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ItemTotalQuantityDTO {
    private String itemName;
    private Long totalQuantity;
}
