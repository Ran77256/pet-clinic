package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private String name;


    @Column(unique = true)
    private String microchipNumber;

    private String description;

    // Svaki ljubimac ima jednog vlasnika
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // Svaki ljubimac ima jednu vrstu
    @ManyToOne
    @JoinColumn(name = "species_id", nullable = false)
    private AnimalType animaltype;

    // Svaki ljubimac ima jednu rasu
    @ManyToOne
    @JoinColumn(name = "breed_id")
    private Breed breed;

    // Ljubimac može imati više zdravstvenih stanja
    @ManyToMany
    @JoinTable(
            name = "pet_health_conditions",
            joinColumns = @JoinColumn(name = "pet_id"),
            inverseJoinColumns = @JoinColumn(name = "condition_id")
    )
    private List<HealthCondition> healthConditions;

    // Ljubimac može imati više termina
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private List<Appointment> appointments;


    @ManyToOne
    @JoinColumn(name = "veterinarian_id", nullable = true)
    private Veterinarian veterinarian;



}
