package com.iis.PetClinic.dto.request;


import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicalReportCreateRequest {
    @NotNull
    private Long petId;
    @NotNull private Long veterinarianId;

     private String ime;     // npr. "Kontrolni pregled"
    @NotNull private LocalDate datum; // datum pregleda

    private String dijagnoza;
    private String razlogPosete;
    private String terapija;
    private String napomena;

    // Item-i koji ulaze u izveštaj (LEKOVI/HRANA/OPREMA) po tvojoj Category šemi
    private List<Integer> itemIds;
}
