// src/main/java/com/iis/PetClinic/model/WaitlistEntry.java
package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist",
        indexes = {
                @Index(name="idx_waitlist_vet_time", columnList = "veterinarian_id, desiredStart, active"),
                @Index(name="idx_waitlist_created", columnList = "createdAt")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WaitlistEntry {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name="pet_id")
    private Pet pet;

    @ManyToOne(optional = false)
    @JoinColumn(name="veterinarian_id")
    private Veterinarian veterinarian;

    @Column(nullable = false)
    private LocalDateTime desiredStart;
    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Column(length = 500)
    private String note;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();

        if (!this.active) this.active = true;
    }
}
