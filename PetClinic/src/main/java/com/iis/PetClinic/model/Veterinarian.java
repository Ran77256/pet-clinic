package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "veterinarians",
        indexes = @Index(name = "idx_vet_fullname", columnList = "last_name, first_name"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Veterinarian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="first_name", nullable = false)
    private String firstName;

    @Column(name="last_name", nullable = false)
    private String lastName;

    private String specialization;   // npr. "hirurg", "dermatolog"...
    private String phoneNumber;

    @Column(unique = true)
    private String email;

    // opcionalno – veze unazad (nije obavezno za rad servisa)
    @OneToMany(mappedBy = "veterinarian")
    private List<Pet> pets;
}
