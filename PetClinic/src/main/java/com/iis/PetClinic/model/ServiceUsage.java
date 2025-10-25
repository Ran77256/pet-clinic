package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Service service;

    @ManyToOne
    private Promotion promotion; // nullable - no promotion applied

    @ManyToOne(optional = false)
    private Pet pet; // which pet received the service

    @ManyToOne
    private User performedBy; // which staff/vet performed it (nullable)

    @Column(nullable = false)
    private LocalDateTime usageDate;

    @Column(precision = 12, scale = 2)
    private BigDecimal pricePaid;

    @Column(precision = 12, scale = 2)
    private BigDecimal savings; // how much was saved due to the promotion
}
