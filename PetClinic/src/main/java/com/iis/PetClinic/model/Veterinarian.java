package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "veterinarians")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Veterinarian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String specialization;   // npr. "hirurg", "dermatolog"...
    private String phoneNumber;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "veterinarian")
    private List<Pet> pets;
}
