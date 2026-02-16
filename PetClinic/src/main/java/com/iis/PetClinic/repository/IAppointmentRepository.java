// com/iis/PetClinic/repository/IAppointmentRepository.java
package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.Appointment;
import com.iis.PetClinic.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface IAppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPet_IdOrderByAppointmentDateAsc(Long petId);

    boolean existsByPet_IdAndAppointmentDate(Long petId, LocalDateTime appointmentDate);
    boolean existsByVeterinarian_IdAndAppointmentDateAndStatusIn(
            Long veterinarianId,
            LocalDateTime appointmentDate,
            Collection<AppointmentStatus> statuses
    );

    List<Appointment> findByPet_IdOrderByAppointmentDateDesc(Long petId);
    List<Appointment> findByPet_IdAndStatusOrderByAppointmentDateDesc(Long petId, AppointmentStatus status);
    List<Appointment> findByPet_Owner_IdOrderByAppointmentDateDesc(Integer ownerId);
    List<Appointment> findByPet_Owner_IdAndStatusOrderByAppointmentDateDesc(Integer ownerId, AppointmentStatus status);

    List<Appointment> findByVeterinarian_IdAndAppointmentDateBetweenOrderByAppointmentDateAsc(
            Long vetId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByVeterinarian_IdOrderByAppointmentDateAsc(Long vetId);

    List<Appointment> findByVeterinarian_IdAndStatusAndAppointmentDateBetweenOrderByAppointmentDateAsc(
            Long vetId, AppointmentStatus status, LocalDateTime start, LocalDateTime end);
    long countByVeterinarian_IdAndAppointmentDateBetween(
            Long veterinarianId, LocalDateTime start, LocalDateTime end);

    boolean existsByVeterinarian_IdAndAppointmentDate(Long veterinarianId, LocalDateTime start);


}
