package com.iis.PetClinic.dto.response;

import com.iis.PetClinic.dto.request.PetDTO;
import com.iis.PetClinic.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private LocalDateTime lastActivated;

    // Ako želiš da se prikazuju i ljubimci vlasnika:
    private List<PetDTO> pets;
}
