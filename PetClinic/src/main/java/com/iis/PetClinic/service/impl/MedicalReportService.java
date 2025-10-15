package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.request.MedicalReportCreateRequest;
import com.iis.PetClinic.dto.request.MedicalReportUpdateRequest;
import com.iis.PetClinic.dto.response.MedicalReportResponse;
import com.iis.PetClinic.exception.NotFoundException;
import com.iis.PetClinic.model.Item;
import com.iis.PetClinic.model.MedicalReport;
import com.iis.PetClinic.model.Pet;
import com.iis.PetClinic.model.Veterinarian;
import com.iis.PetClinic.repository.IItemRepository;
import com.iis.PetClinic.repository.IMedicalReportRepository;
import com.iis.PetClinic.repository.IVeterinarianRepository;
import com.iis.PetClinic.repository.IPetRepository;
import com.iis.PetClinic.service.IMedicalReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalReportService implements IMedicalReportService {

    private final IMedicalReportRepository repo;
    private final IPetRepository petRepo;
    private final IVeterinarianRepository vetRepo;
    private final IItemRepository itemRepo;

    @Override
    public MedicalReportResponse create(MedicalReportCreateRequest req) {
        Pet pet = petRepo.findById(req.getPetId())
                .orElseThrow(() -> new NotFoundException("Pet not found: " + req.getPetId()));
        Veterinarian vet = vetRepo.findById(req.getVeterinarianId())
                .orElseThrow(() -> new NotFoundException("Veterinarian not found: " + req.getVeterinarianId()));

        List<Item> items = (req.getItemIds() == null || req.getItemIds().isEmpty())
                ? List.of()
                : itemRepo.findAllById(req.getItemIds());

        MedicalReport mr = MedicalReport.builder()
                .pet(pet)
                .veterinarian(vet)
                .ime(req.getIme())
                .datum(req.getDatum())
                .dijagnoza(req.getDijagnoza())
                .razlogPosete(req.getRazlogPosete())
                .terapija(req.getTerapija())
                .napomena(req.getNapomena())
                .items(new ArrayList<>(items))
                .build();

        mr = repo.save(mr);
        return toDto(mr);
    }

    @Override
    public MedicalReportResponse update(Long id, MedicalReportUpdateRequest req) {
        MedicalReport mr = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found: " + id));

        if (req.getIme() != null) mr.setIme(req.getIme());
        if (req.getDatum() != null) mr.setDatum(req.getDatum());
        if (req.getDijagnoza() != null) mr.setDijagnoza(req.getDijagnoza());
        if (req.getRazlogPosete() != null) mr.setRazlogPosete(req.getRazlogPosete());
        if (req.getTerapija() != null) mr.setTerapija(req.getTerapija());
        if (req.getNapomena() != null) mr.setNapomena(req.getNapomena());

        if (req.getItemIds() != null) {
            List<Item> items = req.getItemIds().isEmpty() ? List.of() : itemRepo.findAllById(req.getItemIds());
            mr.setItems(new ArrayList<>(items));
        }
        return toDto(mr);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new NotFoundException("Report not found: " + id);
        repo.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalReportResponse get(Long id) {
        return repo.findById(id).map(this::toDto)
                .orElseThrow(() -> new NotFoundException("Report not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalReportResponse> listByPet(Long petId) {
        return repo.findByPet_IdOrderByDatumDesc(petId).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalReportResponse> listByVeterinarian(Long vetId) {
        return repo.findByVeterinarian_IdOrderByDatumDesc(vetId).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalReportResponse> listByPetAndDate(Long petId, LocalDate from, LocalDate to) {
        return repo.findByPet_IdAndDatumBetweenOrderByDatumDesc(petId, from, to).stream().map(this::toDto).toList();
    }

    // mapper
    private MedicalReportResponse toDto(MedicalReport mr) {
        String vetName = mr.getVeterinarian().getUser().getFirstName() + " " +
                mr.getVeterinarian().getUser().getLastName();

        return MedicalReportResponse.builder()
                .id(mr.getId())
                .petId(mr.getPet().getId())
                .petName(mr.getPet().getName())
                .veterinarianId(mr.getVeterinarian().getId())
                .veterinarianFullName(vetName)
                .ime(mr.getIme())
                .datum(mr.getDatum())
                .dijagnoza(mr.getDijagnoza())
                .razlogPosete(mr.getRazlogPosete())
                .terapija(mr.getTerapija())
                .napomena(mr.getNapomena())
                .itemIds(mr.getItems().stream().map(Item::getId).toList())
                .itemNames(mr.getItems().stream().map(Item::getName).toList())
                .createdAt(mr.getCreatedAt())
                .build();
    }
    @Override
    public MedicalReport findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical report not found with id " + id));
    }

}
