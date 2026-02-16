// com/iis/PetClinic/model/Appointment.java
package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "appointments", indexes = {
        @Index(name = "idx_appt_pet_date", columnList = "pet_id, appointmentDate"),
        @Index(name = "idx_appt_vet_date", columnList = "veterinarian_id, appointmentDate")
})
public class Appointment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(length = 120)
    private String reason;

    @Column(length = 1000)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    //  termin je eksplicitno vezan za veterinara
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id")
    private Veterinarian veterinarian;


    /** Da li je termin označen kao hitan (dozvoljeno preklapanje) */
    @Column(nullable = false)
    private boolean urgent = false;
}
