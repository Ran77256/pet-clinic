package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Breed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String healthPredispositions;

    @Column
    private String dietaryNeeds;

    @ManyToOne
    @JoinColumn(name = "animal_type_id", nullable = false)
    private AnimalType animalType;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHealthPredispositions() {
        return healthPredispositions;
    }

    public void setHealthPredispositions(String healthPredispositions) {
        this.healthPredispositions = healthPredispositions;
    }

    public String getDietaryNeeds() {
        return dietaryNeeds;
    }

    public void setDietaryNeeds(String dietaryNeeds) {
        this.dietaryNeeds = dietaryNeeds;
    }

    public AnimalType getAnimalType() {
        return animalType;
    }

    public void setAnimalType(AnimalType animalType) {
        this.animalType = animalType;
    }
}