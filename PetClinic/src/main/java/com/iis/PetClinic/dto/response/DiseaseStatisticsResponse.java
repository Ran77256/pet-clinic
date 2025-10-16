package com.iis.PetClinic.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiseaseStatisticsResponse {
    private String diseaseName;
    private String animalTypeName;
    private Long count;
    private Double percentage;
    
    // Za kompleksniji izveštaj
    private List<MonthlyCount> monthlyData;
    
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyCount {
        private String month;
        private Long count;
    }
}