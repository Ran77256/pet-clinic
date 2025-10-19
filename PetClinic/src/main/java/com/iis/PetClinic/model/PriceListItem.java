package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "price_list_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"price_list_id","service_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="price_list_id")
    private PriceList priceList;

    @ManyToOne(optional=false)
    private Service service;

    @Column(nullable=false, precision=12, scale=2)
    private BigDecimal price; // originalna cena za ovu uslugu

    @Column(precision=12, scale=2)
    private BigDecimal promotionalPrice; // cena sa primenjenim popustom
}
