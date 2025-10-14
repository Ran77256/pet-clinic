package com.iis.PetClinic.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name="notifications")
@NoArgsConstructor
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String description;

    private LocalDate createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
}
