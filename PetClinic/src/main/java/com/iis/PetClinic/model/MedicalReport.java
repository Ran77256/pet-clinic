package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medical_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    @Column(nullable = false)
    private String ime;

    @Column(nullable = false)
    private LocalDate datum;

    private String dijagnoza;
    private String razlogPosete;
    private String terapija;

    @Column(length = 2000)
    private String napomena;

    // NOVO: umesto prescribedMedicineIds / recommendedFoodIds
    @ManyToMany

    private List<Item> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
