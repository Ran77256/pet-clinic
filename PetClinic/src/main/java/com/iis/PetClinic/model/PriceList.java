package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "price_lists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;        // npr. "Zimski cenovnik"

    @Column(nullable=false)
    private Integer version;    // 1,2,3,...

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private PriceListStatus status; // DRAFT / ACTIVE / ARCHIVED

    @Column(nullable=false)
    private LocalDateTime validFrom;

    @Column
    private LocalDateTime validTo;  // null = važi do daljeg

    @OneToMany(mappedBy = "priceList", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PriceListItem> items = new ArrayList<>();

    @Version
    private Long rowVersion; // optimistic locking
}