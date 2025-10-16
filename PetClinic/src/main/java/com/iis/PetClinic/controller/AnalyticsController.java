package com.iis.PetClinic.controller;

import com.iis.PetClinic.dto.response.*;
import com.iis.PetClinic.repository.IMedicalReportRepository;
import com.iis.PetClinic.service.IAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin
@RequiredArgsConstructor
public class AnalyticsController {

    private final IAnalyticsService analyticsService;
    private final IMedicalReportRepository medicalReportRepository;

    /**
     * Kompletan sažetak analitike za period
     * GET /api/analytics/summary?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getAnalyticsSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        AnalyticsSummaryResponse summary = analyticsService.getAnalyticsSummary(startDate, endDate);
        return ResponseEntity.ok(summary);
    }

    /**
     * Najčešće bolesti po vrstama životinja
     * GET /api/analytics/diseases?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/diseases")
    public ResponseEntity<List<DiseaseStatisticsResponse>> getDiseaseStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<DiseaseStatisticsResponse> diseases = analyticsService.getDiseaseStatistics(startDate, endDate);
        return ResponseEntity.ok(diseases);
    }

    /**
     * Najčešće terapije i tretmane
     * GET /api/analytics/therapies?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/therapies")
    public ResponseEntity<List<TherapyStatisticsResponse>> getTherapyStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<TherapyStatisticsResponse> therapies = analyticsService.getTherapyStatistics(startDate, endDate);
        return ResponseEntity.ok(therapies);
    }

    /**
     * Broj vakcinacija u određenom vremenskom periodu
     * GET /api/analytics/vaccinations?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/vaccinations")
    public ResponseEntity<List<VaccinationReportResponse>> getVaccinationStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<VaccinationReportResponse> vaccinations = analyticsService.getVaccinationStatistics(startDate, endDate);
        return ResponseEntity.ok(vaccinations);
    }

    /**
     * Bolesti po određenoj vrsti životinje
     * GET /api/analytics/diseases/by-animal-type/Pas?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/diseases/by-animal-type/{animalType}")
    public ResponseEntity<List<DiseaseStatisticsResponse>> getDiseasesByAnimalType(
            @PathVariable String animalType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<DiseaseStatisticsResponse> diseases = analyticsService.getDiseaseStatisticsByAnimalType(animalType, startDate, endDate);
        return ResponseEntity.ok(diseases);
    }

    /**
     * Mesečni trendovi bolesti (za grafikone)
     * GET /api/analytics/diseases/monthly-trends?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/diseases/monthly-trends")
    public ResponseEntity<List<DiseaseStatisticsResponse>> getDiseaseMonthlyTrends(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<DiseaseStatisticsResponse> trends = analyticsService.getDiseaseMonthlyTrends(startDate, endDate);
        return ResponseEntity.ok(trends);
    }

    // Predefined periodi za brže pozive
    
    /**
     * Analitika za poslednji mesec
     * GET /api/analytics/summary/last-month
     */
    @GetMapping("/summary/last-month")
    public ResponseEntity<AnalyticsSummaryResponse> getLastMonthSummary() {
        AnalyticsSummaryResponse summary = analyticsService.getLastMonthSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Analitika za poslednji kvartal (3 meseca)
     * GET /api/analytics/summary/last-quarter
     */
    @GetMapping("/summary/last-quarter")
    public ResponseEntity<AnalyticsSummaryResponse> getLastQuarterSummary() {
        AnalyticsSummaryResponse summary = analyticsService.getLastQuarterSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Analitika za poslednju godinu
     * GET /api/analytics/summary/last-year
     */
    @GetMapping("/summary/last-year")
    public ResponseEntity<AnalyticsSummaryResponse> getLastYearSummary() {
        AnalyticsSummaryResponse summary = analyticsService.getLastYearSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Zdravstvena statistika za dashboard (kratak pregled)
     * GET /api/analytics/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsSummaryResponse> getDashboardStats() {
        // Poslednji kvartal kao default za dashboard
        return getLastQuarterSummary();
    }

    /**
     * Svi podaci bez datumskog filtra - za testiranje
     * GET /api/analytics/summary/all
     */
    @GetMapping("/summary/all")
    public ResponseEntity<AnalyticsSummaryResponse> getAllDataSummary() {
        // Uzmi sve podatke iz baze
        LocalDate startDate = LocalDate.of(2020, 1, 1); // Daleka prošlost
        LocalDate endDate = LocalDate.now().plusYears(1); // Daleka budućnost
        AnalyticsSummaryResponse summary = analyticsService.getAnalyticsSummary(startDate, endDate);
        return ResponseEntity.ok(summary);
    }

    /**
     * Jednostavno brojanje ukupnih izveštaja u periodu
     * GET /api/analytics/count/reports?startDate=2024-01-01&endDate=2024-12-31
     * GET /api/analytics/count/reports (za sve podatke)
     */
    @GetMapping("/count/reports")
    public ResponseEntity<Map<String, Object>> countReports(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> result = new HashMap<>();
        
        long totalReports;
        long uniquePets;
        
        if (startDate != null && endDate != null) {
            // Brojanje za određeni period
            totalReports = medicalReportRepository.findAll().stream()
                    .filter(report -> !report.getDatum().isBefore(startDate) && !report.getDatum().isAfter(endDate))
                    .count();
                    
            uniquePets = medicalReportRepository.findAll().stream()
                    .filter(report -> !report.getDatum().isBefore(startDate) && !report.getDatum().isAfter(endDate))
                    .map(report -> report.getPet().getId())
                    .distinct()
                    .count();
                    
            result.put("period", startDate + " do " + endDate);
        } else {
            // Svi podaci
            totalReports = medicalReportRepository.count();
            uniquePets = medicalReportRepository.findAll().stream()
                    .map(report -> report.getPet().getId())
                    .distinct()
                    .count();
                    
            result.put("period", "Svi podaci");
        }
        
        result.put("totalReports", totalReports);
        result.put("uniquePets", uniquePets);
        result.put("totalVaccinations", 0L); // Uklonili smo vakcine
        
        return ResponseEntity.ok(result);
    }

    /**
     * Jednostavno brojanje za prethodnih mesec dana
     * GET /api/analytics/count/last-month
     */
    @GetMapping("/count/last-month")
    public ResponseEntity<Map<String, Object>> countLastMonth() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1);
        return countReports(startDate, endDate);
    }

    /**
     * Jednostavno brojanje svih podataka
     * GET /api/analytics/count/all
     */
    @GetMapping("/count/all")
    public ResponseEntity<Map<String, Object>> countAll() {
        return countReports(null, null);
    }
}