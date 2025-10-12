package com.iis.PetClinic.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderRequest {
    private int itemId;
    private int quantity;
    private String email;
}
