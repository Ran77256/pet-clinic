package com.iis.PetClinic.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TherapyStatisticsResponse {
    private String therapyName;
    private String animalTypeName;
    private Long count;
    private Double percentage;
    
    // Povezane bolesti sa ovom terapijom
    private List<String> commonDiseases;
    
    // Podatci po mesecima
    private List<MonthlyTherapy> monthlyData;
    
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyTherapy {
        private String month;
        private Long count;
    }
}