package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BenefitType benefitType; // PERCENTAGE_DISCOUNT / FIXED_AMOUNT_DISCOUNT / FREE_ADDITIONAL_SERVICE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClientType clientType; // INDIVIDUAL / FARM / SHELTER

    @ManyToOne(optional = false)
    private Service service;

    @ManyToOne(optional = false)
    private AnimalType animalType;

    @Column(precision = 12, scale = 2)
    private BigDecimal value; // za procent/fiksni popust; null za besplatnu uslugu

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column
    private LocalDateTime endDate; // null = neograničeno

    // NOVO: veza na cenovnik
    @ManyToOne(optional = false)
    @JoinColumn(name = "price_list_id")
    private PriceList priceList;
}
