package com.iis.PetClinic.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalReportResponse {
    private Long id;

    private Long petId;
    private String petName;

    private Long veterinarianId;
    private String veterinarianFullName;

    private String ime;
    private LocalDate datum;
    private String dijagnoza;
    private String razlogPosete;
    private String terapija;
    private String napomena;

    private List<Integer> itemIds;
    private List<String> itemNames;

    private LocalDateTime createdAt;
}
