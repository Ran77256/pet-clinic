package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface IMedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPet_IdOrderByDatumDesc(Long petId);
    List<MedicalReport> findByVeterinarian_IdOrderByDatumDesc(Long vetId);
    List<MedicalReport> findByPet_IdAndDatumBetweenOrderByDatumDesc(Long petId, LocalDate from, LocalDate to);
}
