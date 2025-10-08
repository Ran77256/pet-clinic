package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IAppointmentRepository extends JpaRepository<Appointment, Long> {

    // --- Pregled po danu (svi termini)
    List<Appointment> findByStartAtBetweenOrderByStartAt(LocalDateTime start, LocalDateTime end);

    // --- Pregled po veterinaru za određeni dan
    List<Appointment> findByVeterinarian_IdAndStartAtBetweenOrderByStartAt(
            Integer veterinarianId, LocalDateTime start, LocalDateTime end);

    // --- Pregled po pacijentu (istorija + predstojeći)
    List<Appointment> findByPet_IdOrderByStartAtDesc(Long petId);

    // --- Provera kolizije termina (za ne-hitne)
    @Query("""
        SELECT a FROM Appointment a
        WHERE a.veterinarian.id = :vetId
          AND a.startAt < :endAt
          AND a.endAt   > :startAt
          AND a.status <> com.iis.PetClinic.model.AppointmentStatus.CANCELLED
    """)
    List<Appointment> checkOverlap(Integer vetId, LocalDateTime startAt, LocalDateTime endAt);
}
