package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.request.VeterinarianCreateUpdateDTO;
import com.iis.PetClinic.dto.response.VeterinarianResponseDTO;
import com.iis.PetClinic.exception.BadRequestException;
import com.iis.PetClinic.exception.NotFoundException;
import com.iis.PetClinic.model.Role;
import com.iis.PetClinic.model.User;
import com.iis.PetClinic.model.Veterinarian;
import com.iis.PetClinic.repository.IVeterinarianRepository;
import com.iis.PetClinic.repository.IUserRepository;
import com.iis.PetClinic.service.IVeterinarianService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VeterinarianService implements IVeterinarianService {

    private final IVeterinarianRepository vetRepo;
    private final IUserRepository userRepo;

    @Override
    @Transactional
    public VeterinarianResponseDTO create(VeterinarianCreateUpdateDTO dto) {
        User user = resolveOrCreateUser(dto);
        ensureUserRoleIsVeterinarian(user);

        if (vetRepo.findByUser_Id((long) user.getId()).isPresent()) {
            throw new BadRequestException("Veterinarian already exists for user id=" + user.getId());
        }

        Veterinarian v = Veterinarian.builder()
                .user(user)
                .specialization(dto.getSpecialization())
                .phoneNumber(dto.getPhoneNumber())
                .build();

        v = vetRepo.save(v);
        long petsCount = v.getPets() == null ? 0 : v.getPets().size();
        return toDto(v, petsCount);
    }

    @Override
    @Transactional
    public VeterinarianResponseDTO update(Long id, VeterinarianCreateUpdateDTO dto) {
        Veterinarian v = vetRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found: " + id));

        // update vet fields
        v.setSpecialization(dto.getSpecialization());
        v.setPhoneNumber(dto.getPhoneNumber());

        // optionally (re)link to user
        if (dto.getUserId() != null || dto.getEmail() != null) {
            User user = resolveOrCreateUser(dto);
            ensureUserRoleIsVeterinarian(user);
            v.setUser(user);
        }

        v = vetRepo.save(v);
        long petsCount = v.getPets() == null ? 0 : v.getPets().size();
        return toDto(v, petsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public VeterinarianResponseDTO get(Long id) {
        Veterinarian v = vetRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian not found: " + id));
        long petsCount = v.getPets() == null ? 0 : v.getPets().size();
        return toDto(v, petsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VeterinarianResponseDTO> list(String q) {
        List<Veterinarian> list = (q == null || q.isBlank())
                ? vetRepo.findAll()
                : vetRepo.searchByUserName(q.trim());

        return list.stream()
                .map(v -> toDto(v, v.getPets() == null ? 0 : v.getPets().size()))
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // 1. Pronađi veterinara po njegovom ID-ju (iz `veterinarians` tabele)
        Veterinarian vet = vetRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Veterinarian with ID " + id + " not found."));

        // 2. Pronađi povezanog KORISNIKA (User)
        User userToDelete = vet.getUser();
        if (userToDelete == null) {
            // Ako iz nekog razloga ne postoji povezan user, obriši samo veterinara
            vetRepo.deleteById(id);
            return;
        }

        // 3. Obriši KORISNIKA (User-a). Ova komanda će aktivirati naš PL/SQL triger!
        // Triger će proveriti pacijente, arhivirati podatke, obrisati zapis iz `veterinarians`
        // i na kraju dozvoliti da se ovaj user obriše.
        userRepo.delete(userToDelete);
    }


    private VeterinarianResponseDTO toDto(Veterinarian v, long petsCount) {
        User u = v.getUser();
        return VeterinarianResponseDTO.builder()
                .id(v.getId())
                .specialization(v.getSpecialization())
                .phoneNumber(v.getPhoneNumber())
                .userId(u != null ? (long) u.getId() : null)
                .firstName(u != null ? u.getFirstName() : null)
                .lastName(u != null ? u.getLastName() : null)
                .email(u != null ? u.getEmail() : null)
                .petsCount(petsCount)
                .build();
    }

    private User resolveOrCreateUser(VeterinarianCreateUpdateDTO dto) {
        if (dto.getUserId() != null) {
            return userRepo.findById(dto.getUserId().intValue())
                    .orElseThrow(() -> new NotFoundException("User not found: " + dto.getUserId()));
        }
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new BadRequestException("Provide userId or email to link veterinarian to a user.");
        }

        // try to find by email
        User existing = userRepo.findByEmailIgnoreCase(dto.getEmail()).orElse(null);
        if (existing != null) {
            // optionally update names/password if provided
            if (dto.getFirstName() != null) existing.setFirstName(dto.getFirstName());
            if (dto.getLastName() != null)  existing.setLastName(dto.getLastName());
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                existing.setPassword(dto.getPassword());
            }
            return userRepo.save(existing);
        }

        // create new user
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new BadRequestException("Password is required when creating a new user.");
        }

        User u = new User();
        u.setFirstName(dto.getFirstName());
        u.setLastName(dto.getLastName());
        u.setEmail(dto.getEmail());
        u.setPassword(dto.getPassword());
        u.setRole(Role.VETERINARIAN);
        return userRepo.save(u);
    }

    private void ensureUserRoleIsVeterinarian(User user) {
        if (user.getRole() == null) {
            user.setRole(Role.VETERINARIAN);
            userRepo.save(user);
            return;
        }
        if (user.getRole() != Role.VETERINARIAN) {
            // po potrebi možeš relaksirati (ADMIN kao VET, itd.)
            throw new BadRequestException(
                    "Linked user must have role VETERINARIAN (userId=" + user.getId() + ").");
        }
    }
}
