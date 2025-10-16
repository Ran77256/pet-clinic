package com.iis.PetClinic.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsSummaryResponse {
    private LocalDate periodStart;
    private LocalDate periodEnd;
    
    // Osnovna statistika
    private Long totalReports;
    private Long totalPets;
    private Long totalVaccinations;
    
    // Top 5 najčešćih
    private List<DiseaseStatisticsResponse> topDiseases;
    private List<TherapyStatisticsResponse> topTherapies;
    private List<VaccinationReportResponse> topVaccinations;
    
    // Trendovi po vrstama životinja
    private List<AnimalTypeStats> animalTypeStatistics;
    
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AnimalTypeStats {
        private String animalTypeName;
        private Long reportCount;
        private String mostCommonDisease;
        private String mostCommonTherapy;
    }
}