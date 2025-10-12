package com.iis.PetClinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderResponse {
    private int id;
    private LocalDateTime creationDate;
    private int quantity;
    private String email;
    private String status;
    private String type;
    private String itemName;
}
