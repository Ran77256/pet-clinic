package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.response.*;
import com.iis.PetClinic.repository.IAnalyticsRepository;
import com.iis.PetClinic.repository.IMedicalReportRepository;
import com.iis.PetClinic.service.IAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService implements IAnalyticsService {

    private final IAnalyticsRepository analyticsRepository;
    private final IMedicalReportRepository medicalReportRepository;

    // Helper method for safe number casting from PostgreSQL COUNT results
    private Long safeLongCast(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number) {
            return ((Number) obj).longValue();
        }
        return 0L;
    }

    @Override
    public List<DiseaseStatisticsResponse> getDiseaseStatistics(LocalDate startDate, LocalDate endDate) {
        try {
            List<Object[]> results = analyticsRepository.findDiseaseStatisticsByAnimalType(startDate, endDate);
            
            if (results == null || results.isEmpty()) {
                return Collections.emptyList();
            }
            
            // Računamo ukupan broj za procente
            long totalCount = results.stream().mapToLong(r -> (Long) r[2]).sum();
            
            return results.stream()
                    .filter(result -> result != null && result.length >= 3)
                    .map(result -> DiseaseStatisticsResponse.builder()
                            .diseaseName((String) result[0])
                            .animalTypeName((String) result[1])
                            .count(safeLongCast(result[2]))
                            .percentage(totalCount > 0 ? (safeLongCast(result[2]) * 100.0) / totalCount : 0.0)
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getDiseaseStatistics: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<TherapyStatisticsResponse> getTherapyStatistics(LocalDate startDate, LocalDate endDate) {
        try {
            List<Object[]> results = analyticsRepository.findTherapyStatisticsByAnimalType(startDate, endDate);
            
            if (results == null || results.isEmpty()) {
                return Collections.emptyList();
            }
            
            long totalCount = results.stream().mapToLong(r -> (Long) r[2]).sum();
            
            return results.stream()
                    .filter(result -> result != null && result.length >= 3)
                    .map(result -> TherapyStatisticsResponse.builder()
                            .therapyName((String) result[0])
                            .animalTypeName((String) result[1])
                            .count(safeLongCast(result[2]))
                            .percentage(totalCount > 0 ? (safeLongCast(result[2]) * 100.0) / totalCount : 0.0)
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getTherapyStatistics: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<VaccinationReportResponse> getVaccinationStatistics(LocalDate startDate, LocalDate endDate) {
        try {
            List<Object[]> results = analyticsRepository.findVaccinationStatistics(startDate, endDate);
            
            if (results == null || results.isEmpty()) {
                return Collections.emptyList();
            }
            
            return results.stream()
                    .filter(result -> result != null && result.length >= 3)
                    .map(result -> VaccinationReportResponse.builder()
                            .vaccineName((String) result[0])
                            .animalTypeName((String) result[1])
                            .count(safeLongCast(result[2]))
                            .periodStart(startDate)
                            .periodEnd(endDate)
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error in getVaccinationStatistics: " + e.getMessage());
            return Collections.emptyList();
        }
    }    @Override
    public AnalyticsSummaryResponse getAnalyticsSummary(LocalDate startDate, LocalDate endDate) {
        try {
            // Direktno brojanje iz MedicalReportRepository
            long totalReports;
            long totalPets;
            
            if (startDate != null && endDate != null) {
                // Brojanje za određeni period
                totalReports = medicalReportRepository.findAll().stream()
                        .filter(report -> !report.getDatum().isBefore(startDate) && !report.getDatum().isAfter(endDate))
                        .count();
                        
                totalPets = medicalReportRepository.findAll().stream()
                        .filter(report -> !report.getDatum().isBefore(startDate) && !report.getDatum().isAfter(endDate))
                        .map(report -> report.getPet().getId())
                        .distinct()
                        .count();
            } else {
                // Svi podaci
                totalReports = medicalReportRepository.count();
                totalPets = medicalReportRepository.findAll().stream()
                        .map(report -> report.getPet().getId())
                        .distinct()
                        .count();
            }

            // Top 5 bolesti sa safe handling
            List<DiseaseStatisticsResponse> topDiseases = Collections.emptyList();
            try {
                topDiseases = getDiseaseStatistics(startDate, endDate)
                        .stream().limit(5).collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error getting disease statistics: " + e.getMessage());
            }

            // Top 5 terapija sa safe handling
            List<TherapyStatisticsResponse> topTherapies = Collections.emptyList();
            try {
                topTherapies = getTherapyStatistics(startDate, endDate)
                        .stream().limit(5).collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error getting therapy statistics: " + e.getMessage());
            }

            // Statistike po vrstama životinja sa safe handling
            List<AnalyticsSummaryResponse.AnimalTypeStats> animalStats = Collections.emptyList();
            try {
                List<Object[]> animalStatsData = analyticsRepository.findAnimalTypeStatistics(startDate, endDate);
                if (animalStatsData != null) {
                    animalStats = animalStatsData.stream()
                            .filter(result -> result != null && result.length >= 4)
                            .map(result -> new AnalyticsSummaryResponse.AnimalTypeStats(
                                    (String) result[0], // animalTypeName
                                    safeLongCast(result[1]),   // reportCount
                                    (String) result[2], // mostCommonDisease
                                    (String) result[3]  // mostCommonTherapy
                            ))
                            .collect(Collectors.toList());
                }
            } catch (Exception e) {
                System.err.println("Error getting animal type statistics: " + e.getMessage());
            }

            return AnalyticsSummaryResponse.builder()
                    .periodStart(startDate)
                    .periodEnd(endDate)
                    .totalReports(totalReports)
                    .totalPets(totalPets)
                    .totalVaccinations(0L) // Uklanjamo vakcine - samo hardcoded 0
                    .topDiseases(topDiseases)
                    .topTherapies(topTherapies)
                    .topVaccinations(Collections.emptyList()) // Uvek prazan lista za vakcine
                    .animalTypeStatistics(animalStats)
                    .build();
        } catch (Exception e) {
            System.err.println("Error in getAnalyticsSummary: " + e.getMessage());
            // Return empty summary in case of error
            return AnalyticsSummaryResponse.builder()
                    .periodStart(startDate)
                    .periodEnd(endDate)
                    .totalReports(0L)
                    .totalPets(0L)
                    .totalVaccinations(0L)
                    .topDiseases(Collections.emptyList())
                    .topTherapies(Collections.emptyList())
                    .topVaccinations(Collections.emptyList())
                    .animalTypeStatistics(Collections.emptyList())
                    .build();
        }
    }

    @Override
    public List<DiseaseStatisticsResponse> getDiseaseStatisticsByAnimalType(String animalType, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = analyticsRepository.findTopDiseasesByAnimalType(animalType, startDate, endDate);
        
        long totalCount = results.stream().mapToLong(r -> (Long) r[2]).sum();
        
        return results.stream()
                .map(result -> DiseaseStatisticsResponse.builder()
                        .diseaseName((String) result[0])
                        .animalTypeName((String) result[1])
                        .count(safeLongCast(result[2]))
                        .percentage(totalCount > 0 ? (safeLongCast(result[2]) * 100.0) / totalCount : 0.0)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<DiseaseStatisticsResponse> getDiseaseMonthlyTrends(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = analyticsRepository.findDiseaseMonthlyStatistics(startDate, endDate);
        
        // Grupišemo po bolesti
        Map<String, List<DiseaseStatisticsResponse.MonthlyCount>> diseaseMonthlyMap = new HashMap<>();
        
        for (Object[] result : results) {
            Integer year = (Integer) result[0];
            Integer month = (Integer) result[1];
            String disease = (String) result[2];
            Long count = safeLongCast(result[3]);
            
            String monthName = LocalDate.of(year, month, 1)
                    .getMonth()
                    .getDisplayName(TextStyle.FULL, Locale.getDefault());
            
            diseaseMonthlyMap.computeIfAbsent(disease, k -> new ArrayList<>())
                    .add(new DiseaseStatisticsResponse.MonthlyCount(monthName + " " + year, count));
        }
        
        return diseaseMonthlyMap.entrySet().stream()
                .map(entry -> DiseaseStatisticsResponse.builder()
                        .diseaseName(entry.getKey())
                        .monthlyData(entry.getValue())
                        .count(entry.getValue().stream().mapToLong(DiseaseStatisticsResponse.MonthlyCount::getCount).sum())
                        .build())
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());
    }

    @Override
    public AnalyticsSummaryResponse getLastMonthSummary() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1);
        return getAnalyticsSummary(startDate, endDate);
    }

    @Override
    public AnalyticsSummaryResponse getLastQuarterSummary() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1); // Promenio sa 3 na 1 mesec - sada isto kao last-month
        return getAnalyticsSummary(startDate, endDate);
    }

    @Override
    public AnalyticsSummaryResponse getLastYearSummary() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(1);
        return getAnalyticsSummary(startDate, endDate);
    }
}