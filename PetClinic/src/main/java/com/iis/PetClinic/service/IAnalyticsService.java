package com.iis.PetClinic.service;

import com.iis.PetClinic.dto.response.*;

import java.time.LocalDate;
import java.util.List;

public interface IAnalyticsService {
    
    // Osnovni izveštaji
    List<DiseaseStatisticsResponse> getDiseaseStatistics(LocalDate startDate, LocalDate endDate);
    List<TherapyStatisticsResponse> getTherapyStatistics(LocalDate startDate, LocalDate endDate);
    List<VaccinationReportResponse> getVaccinationStatistics(LocalDate startDate, LocalDate endDate);
    
    // Kompletan izveštaj
    AnalyticsSummaryResponse getAnalyticsSummary(LocalDate startDate, LocalDate endDate);
    
    // Izveštaji po vrsti životinja
    List<DiseaseStatisticsResponse> getDiseaseStatisticsByAnimalType(String animalType, LocalDate startDate, LocalDate endDate);
    
    // Trendovi po mesecima
    List<DiseaseStatisticsResponse> getDiseaseMonthlyTrends(LocalDate startDate, LocalDate endDate);
    
    // Predefined periodi za brže pozive
    AnalyticsSummaryResponse getLastMonthSummary();
    AnalyticsSummaryResponse getLastQuarterSummary();
    AnalyticsSummaryResponse getLastYearSummary();
}