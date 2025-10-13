package com.iis.PetClinic.service.impl;


import com.iis.PetClinic.dto.request.VeterinarianCreateUpdateDTO;
import com.iis.PetClinic.dto.response.VeterinarianResponseDTO;
import com.iis.PetClinic.exception.BadRequestException;
import com.iis.PetClinic.exception.NotFoundException;
import com.iis.PetClinic.model.Veterinarian;
import com.iis.PetClinic.repository.IVeterinarianRepository;
import com.iis.PetClinic.service.IVeterinarianService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VeterinarianService implements IVeterinarianService {

    private final IVeterinarianRepository repository;

    @Override
    public VeterinarianResponseDTO create(VeterinarianCreateUpdateDTO dto) {
        if (dto.getEmail() != null && repository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new BadRequestException("Vet with given email already exists.");
        }
        Veterinarian v = toEntity(dto);
        v = repository.save(v);
        return toDto(v, 0);
    }

    @Override
    public VeterinarianResponseDTO update(Long id, VeterinarianCreateUpdateDTO dto) {
        Veterinarian v = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found: " + id));

        // provera jedinstvenosti email-a ako se menja
        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(v.getEmail())
                && repository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new BadRequestException("Email already in use.");
        }

        v.setFirstName(dto.getFirstName());
        v.setLastName(dto.getLastName());
        v.setSpecialization(dto.getSpecialization());
        v.setPhoneNumber(dto.getPhoneNumber());
        v.setEmail(dto.getEmail());

        return toDto(v, v.getPets() == null ? 0 : v.getPets().size());
    }

    @Override
    @Transactional(readOnly = true)
    public VeterinarianResponseDTO get(Long id) {
        Veterinarian v = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found: " + id));
        return toDto(v, v.getPets() == null ? 0 : v.getPets().size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinarianResponseDTO> list(String q) {
        List<Veterinarian> list = (q == null || q.isBlank())
                ? repository.findAll()
                : repository.findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCase(q, q);

        return list.stream()
                .map(v -> toDto(v, v.getPets() == null ? 0 : v.getPets().size()))
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new NotFoundException("Veterinarian not found: " + id);
        repository.deleteById(id);
    }

    // helpers
    private Veterinarian toEntity(VeterinarianCreateUpdateDTO dto) {
        return Veterinarian.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .specialization(dto.getSpecialization())
                .phoneNumber(dto.getPhoneNumber())
                .email(dto.getEmail())
                .build();
    }

    private VeterinarianResponseDTO toDto(Veterinarian v, long petsCount) {
        return VeterinarianResponseDTO.builder()
                .id(v.getId())
                .firstName(v.getFirstName())
                .lastName(v.getLastName())
                .specialization(v.getSpecialization())
                .phoneNumber(v.getPhoneNumber())
                .email(v.getEmail())
                .petsCount(petsCount)
                .build();
    }
}
