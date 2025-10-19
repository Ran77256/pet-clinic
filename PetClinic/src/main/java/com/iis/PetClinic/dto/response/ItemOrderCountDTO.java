package com.iis.PetClinic.dto.response;

import com.iis.PetClinic.model.Item;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ItemOrderCountDTO {

    private Item item;
    private Long orderCount;
}
