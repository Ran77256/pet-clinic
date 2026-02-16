package com.iis.PetClinic.controller;

import com.iis.PetClinic.service.impl.AnalyticsServiceStaff;
import com.iis.PetClinic.repository.IVeterinarianRepository; // DODAJ OVO
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*; // Za List, Map, HashMap, ArrayList

@RestController
@RequestMapping("/api/analyticss")
@RequiredArgsConstructor
@CrossOrigin
public class AnalyticsControllerStaff {

    private final AnalyticsServiceStaff service;
    private final IVeterinarianRepository vetRepo; // DODAJ OVO (da bi direktno pozvala bazu)

    // Tvoja postojeća metoda za grafikone
    @GetMapping("/appointments")
    public ResponseEntity<Map<String, Object>> appointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) Long veterinarianId
    ) {
        return ResponseEntity.ok(service.analyze(from, to, status, veterinarianId));
    }

    // NOVA METODA ZA PL/SQL IZVEŠTAJ (Dugme na frontendu)
    @GetMapping("/veterinarian-performance")
    public ResponseEntity<List<Map<String, Object>>> getVetPerformance(@RequestParam int year) {
        // 1. Pozivaš native query iz repozitorijuma koji pokreće tvoju SQL funkciju
        List<Object[]> results = vetRepo.getPerformanceReport(year);

        // 2. Prepakuješ Object[] u List<Map> kako bi React dobio čist JSON
        List<Map<String, Object>> report = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("veterinar_ime_prezime", row[0]);
            map.put("specijalizacija", row[1]);
            map.put("ukupno_pregleda", row[2]);
            map.put("broj_razlicitih_vrsta", row[3]);
            map.put("broj_hitnih_slucajeva", row[4]);
            map.put("napomena", row[5]);
            report.add(map);
        }

        return ResponseEntity.ok(report);
    }
}