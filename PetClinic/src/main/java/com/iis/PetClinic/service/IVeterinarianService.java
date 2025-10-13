package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.request.VeterinarianCreateUpdateDTO;
import com.iis.PetClinic.dto.response.VeterinarianResponseDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface IVeterinarianService {
    VeterinarianResponseDTO create(VeterinarianCreateUpdateDTO dto);

    VeterinarianResponseDTO update(Long id, VeterinarianCreateUpdateDTO dto);

    @Transactional(readOnly = true)
    VeterinarianResponseDTO get(Long id);

    @Transactional(readOnly = true)
    List<VeterinarianResponseDTO> list(String q);

    void delete(Long id);
}
