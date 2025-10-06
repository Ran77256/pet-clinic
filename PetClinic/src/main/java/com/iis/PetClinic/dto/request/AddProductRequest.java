package com.iis.PetClinic.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddProductRequest {
    private String barcode;
    private int quantity;
    private LocalDate expirationDate;
    private LocalDate entryDate;
    private int itemId;
}
