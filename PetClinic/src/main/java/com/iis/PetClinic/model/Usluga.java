package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usluga {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                  // id usluge

    @Column(nullable=false)
    private String naziv;

    @Column(columnDefinition = "TEXT")
    private String opis;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private TipKlijenta tipKlijenta;  // POJEDINAC / FARMA / AZIL

    @ManyToOne(optional=false)
    private VrstaZivotinje vrstaZivotinje;
}
