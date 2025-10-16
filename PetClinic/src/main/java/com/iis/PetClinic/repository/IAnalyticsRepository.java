package com.iis.PetClinic.repository;

import com.iis.PetClinic.model.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface IAnalyticsRepository extends JpaRepository<MedicalReport, Long> {

    // Najčešće bolesti po vrsti životinja
    @Query("""
        SELECT mr.dijagnoza as disease, 
               at.name as animalType, 
               COUNT(*) as count
        FROM MedicalReport mr 
        JOIN mr.pet p 
        JOIN p.animaltype at 
        WHERE mr.dijagnoza IS NOT NULL 
          AND mr.datum BETWEEN :startDate AND :endDate
        GROUP BY mr.dijagnoza, at.name 
        ORDER BY COUNT(*) DESC
        """)
    List<Object[]> findDiseaseStatisticsByAnimalType(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    // Najčešće terapije
    @Query("""
        SELECT mr.terapija as therapy, 
               at.name as animalType, 
               COUNT(*) as count
        FROM MedicalReport mr 
        JOIN mr.pet p 
        JOIN p.animaltype at 
        WHERE mr.terapija IS NOT NULL 
          AND mr.datum BETWEEN :startDate AND :endDate
        GROUP BY mr.terapija, at.name 
        ORDER BY COUNT(*) DESC
        """)
    List<Object[]> findTherapyStatisticsByAnimalType(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    // Vakcinacije (iz items-a koji su vakcine)
    @Query("""
        SELECT i.name as vaccineName, 
               at.name as animalType, 
               COUNT(*) as count
        FROM MedicalReport mr 
        JOIN mr.items i 
        JOIN mr.pet p 
        JOIN p.animaltype at 
        WHERE i.category.name = 'MEDICINE' 
          AND (LOWER(i.name) LIKE '%vakcin%' OR LOWER(i.name) LIKE '%vaccin%')
          AND mr.datum BETWEEN :startDate AND :endDate
        GROUP BY i.name, at.name 
        ORDER BY COUNT(*) DESC
        """)
    List<Object[]> findVaccinationStatistics(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    // Statistike po mesecima za bolesti
    @Query("""
        SELECT EXTRACT(YEAR FROM mr.datum) as year,
               EXTRACT(MONTH FROM mr.datum) as month,
               mr.dijagnoza as disease,
               COUNT(*) as count
        FROM MedicalReport mr 
        WHERE mr.dijagnoza IS NOT NULL 
          AND mr.datum BETWEEN :startDate AND :endDate
        GROUP BY EXTRACT(YEAR FROM mr.datum), EXTRACT(MONTH FROM mr.datum), mr.dijagnoza
        ORDER BY year, month, COUNT(*) DESC
        """)
    List<Object[]> findDiseaseMonthlyStatistics(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    // Ukupna statistika za period - ispravljena verzija bez vakcinacija
    @Query("""
        SELECT COUNT(*) as totalReports,
               COUNT(DISTINCT mr.pet.id) as totalPets
        FROM MedicalReport mr 
        WHERE mr.datum BETWEEN :startDate AND :endDate
        """)
    Object[] findSummaryStatistics(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    // Najčešće bolesti po vrsti životinje (top 5)
    @Query("""
        SELECT mr.dijagnoza as disease, 
               at.name as animalType, 
               COUNT(*) as count
        FROM MedicalReport mr 
        JOIN mr.pet p 
        JOIN p.animaltype at 
        WHERE mr.dijagnoza IS NOT NULL 
          AND mr.datum BETWEEN :startDate AND :endDate
          AND at.name = :animalType
        GROUP BY mr.dijagnoza, at.name 
        ORDER BY COUNT(*) DESC
        """)
    List<Object[]> findTopDiseasesByAnimalType(
        @Param("animalType") String animalType,
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    // Statistike za sve vrste životinja
    @Query("""
        SELECT at.name as animalType,
               COUNT(*) as reportCount,
               (SELECT mr2.dijagnoza 
                FROM MedicalReport mr2 
                JOIN mr2.pet p2 
                WHERE p2.animaltype.id = at.id 
                  AND mr2.dijagnoza IS NOT NULL
                  AND mr2.datum BETWEEN :startDate AND :endDate
                GROUP BY mr2.dijagnoza 
                ORDER BY COUNT(*) DESC 
                LIMIT 1) as mostCommonDisease,
               (SELECT mr3.terapija 
                FROM MedicalReport mr3 
                JOIN mr3.pet p3 
                WHERE p3.animaltype.id = at.id 
                  AND mr3.terapija IS NOT NULL
                  AND mr3.datum BETWEEN :startDate AND :endDate
                GROUP BY mr3.terapija 
                ORDER BY COUNT(*) DESC 
                LIMIT 1) as mostCommonTherapy
        FROM AnimalType at
        JOIN Pet p ON p.animaltype.id = at.id
        JOIN MedicalReport mr ON mr.pet.id = p.id
        WHERE mr.datum BETWEEN :startDate AND :endDate
        GROUP BY at.id, at.name
        ORDER BY COUNT(*) DESC
        """)
    List<Object[]> findAnimalTypeStatistics(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );
}