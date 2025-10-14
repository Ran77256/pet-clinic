package com.iis.PetClinic.dto.request;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalReportUpdateRequest {
    private String ime;
    private LocalDate datum;
    private String dijagnoza;
    private String razlogPosete;
    private String terapija;
    private String napomena;

    // ako pošalješ – kompletno zamenjuje listu stavki u izveštaju
    private List<Integer> itemIds;
}
