// src/main/java/com/iis/PetClinic/repository/IWaitlistRepository.java
package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IWaitlistRepository extends JpaRepository<WaitlistEntry, Long> {

    boolean existsByPet_IdAndDesiredStartAndActive(Long petId, LocalDateTime desiredStart, boolean active);

    Optional<WaitlistEntry> findFirstByVeterinarian_IdAndDesiredStartAndActiveOrderByCreatedAtAsc(
            Long veterinarianId, LocalDateTime desiredStart, boolean active);

    List<WaitlistEntry> findByActiveTrueOrderByDesiredStartAscCreatedAtAsc();

    List<WaitlistEntry> findByVeterinarian_IdAndActiveOrderByDesiredStartAscCreatedAtAsc(Long vetId, boolean active);

    List<WaitlistEntry> findByVeterinarian_IdAndDesiredStartBetweenAndActiveOrderByDesiredStartAscCreatedAtAsc(
            Long vetId, LocalDateTime from, LocalDateTime to, boolean active);
}
