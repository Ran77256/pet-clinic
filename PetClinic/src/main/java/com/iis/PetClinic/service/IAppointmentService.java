package com.iis.PetClinic.service;

import com.iis.PetClinic.model.Appointment;

import java.time.LocalDate;
import java.util.List;

public interface IAppointmentService {
    Appointment create(Appointment a);                     // validacija, kolizije
    List<Appointment> day(LocalDate date);                 // dnevni pregled (svi)
    List<Appointment> dayForVet(Integer vetId, LocalDate d);  // dnevni pregled po vetu
    List<Appointment> forPet(Long petId);                  // istorija/predstojeći po pacijentu
    Appointment updateStatus(Long id, String status);      // npr. COMPLETED/IN_PROGRESS...
}