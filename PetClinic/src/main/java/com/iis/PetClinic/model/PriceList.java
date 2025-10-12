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
@Table(
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"service_id", "startDate", "endDate"}
        )
)
public class PriceList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Service service;

    //@Column(nullable = false)
   // private LocalDateTime startDate;

    @Column
    private LocalDateTime endDate; // nullable = unlimited duration


}
