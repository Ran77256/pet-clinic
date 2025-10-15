package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.request.MedicalReportCreateRequest;
import com.iis.PetClinic.dto.request.MedicalReportUpdateRequest;
import com.iis.PetClinic.dto.response.MedicalReportResponse;
import com.iis.PetClinic.model.MedicalReport;

import java.time.LocalDate;
import java.util.List;

public interface IMedicalReportService {
    MedicalReportResponse create(MedicalReportCreateRequest req);
    MedicalReportResponse update(Long id, MedicalReportUpdateRequest req);
    void delete(Long id);
    MedicalReportResponse get(Long id);
    MedicalReport findById(Long id);


    List<MedicalReportResponse> listByPet(Long petId);
    List<MedicalReportResponse> listByVeterinarian(Long vetId);
    List<MedicalReportResponse> listByPetAndDate(Long petId, LocalDate from, LocalDate to);
}
