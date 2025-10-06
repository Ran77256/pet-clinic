package com.iis.PetClinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private int barcode;

    private int quantity;

    private LocalDate entryDate;

    private LocalDate expirationDate;

    private String supplierEmail;

    private LocalDate writeOffDate;

    private String reason;

    private String consumedQuantity;

    private int itemId;
}
