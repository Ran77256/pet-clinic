package com.iis.PetClinic.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VaccinationReportResponse {
    private String vaccineName;
    private String animalTypeName;
    private Long count;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    
    // Detalji po mesecima
    private List<MonthlyVaccination> monthlyData;
    
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyVaccination {
        private String month;
        private Long count;
        private List<String> animalTypes;
    }
}