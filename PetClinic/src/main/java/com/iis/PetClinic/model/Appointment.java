package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "appointments",
        indexes = {
                @Index(name="ix_appt_start", columnList="start_at"),
                @Index(name="ix_appt_vet_start", columnList="veterinarian_id,start_at"),
                @Index(name="ix_appt_pet", columnList="pet_id")
        })

public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;




//    @Column(nullable = false)
//    private LocalDateTime appointmentDate;


    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;




    @Column(name="start_at", nullable=false)
    private LocalDateTime startAt;

    @Column(name="end_at", nullable=false)
    private LocalDateTime endAt;                 // ili durationMin umesto endAt

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(nullable=false)
    private boolean urgent = false;

    @Enumerated(EnumType.STRING)
    private UrgencyPriority priority;   // može biti null

    // ko obavlja
    @ManyToOne(optional=false)
    @JoinColumn(name="veterinarian_id")
    private User veterinarian;                   // User sa role=VETERINARIAN

    // ko je kreirao (npr. STAFF_ADMIN/recepcija); može biti null ako kreira korisnik online
    @ManyToOne
    @JoinColumn(name="created_by_id")
    private User createdBy;


    // vrsta intervencije/usluga
    @ManyToOne(optional=false)
    @JoinColumn(name="service_id")
    private Service service;

    @Column(length=1000)
    private String note;

}
