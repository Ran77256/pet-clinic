package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
public class Product{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true)
    private int barcode;

    private int quantity;

    private LocalDate entryDate;

    private LocalDate expirationDate;

    private String supplierEmail;

    private LocalDate writeOffDate;

    private String reason;

    private String consumedQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;
}
