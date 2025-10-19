// com/iis/PetClinic/service/impl/PromotionServiceImpl.java
package com.iis.PetClinic.service.impl;

import com.iis.PetClinic.dto.response.PromotionDTO;
import com.iis.PetClinic.model.Promotion;
import com.iis.PetClinic.repository.IPromotionRepository;
import com.iis.PetClinic.service.IPromotionService;
import com.iis.PetClinic.service.IPromotionalPricingService;
import com.iis.PetClinic.model.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements IPromotionService {

    private final IPromotionRepository repo;
    private final IPromotionalPricingService promotionalPricingService;

    @Override
    public List<Promotion> getAllPromotions() {
        return repo.findAll();
    }

    @Override
    public Optional<Promotion> getPromotionById(Long id) {
        return repo.findById(id);
    }

    @Override
    public Promotion addPromotion(Promotion promotion) {
        validateAndSetStatus(promotion);
        return repo.save(promotion);
    }

    @Override
    public Promotion updatePromotion(Long id, Promotion updatedPromotion) {
        return repo.findById(id)
                .map(existing -> {
                    existing.setName(updatedPromotion.getName());
                    existing.setBenefitType(updatedPromotion.getBenefitType());
                    existing.setClientType(updatedPromotion.getClientType());
                    existing.setServices(updatedPromotion.getServices());
                    existing.setAnimalType(updatedPromotion.getAnimalType());
                    existing.setValue(updatedPromotion.getValue());
                    existing.setStartDate(updatedPromotion.getStartDate());
                    existing.setEndDate(updatedPromotion.getEndDate());
                    validateAndSetStatus(existing);
                    return repo.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + id));
    }

    @Override
    public void deletePromotion(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Promotion not found with id " + id);
        }
        repo.deleteById(id);
    }

    public List<PromotionDTO> getAllPromotionDTOs() {
        return repo.findAll().stream()
                .map(p -> {
                    List<PromotionDTO.ServiceInfo> serviceInfos = p.getServices().stream()
                            .map(service -> new PromotionDTO.ServiceInfo(service.getId(), service.getName()))
                            .collect(Collectors.toList());
                    
                    return PromotionDTO.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .benefitType(p.getBenefitType().name())
                            .status(p.getStatus().name())
                            .services(serviceInfos)
                            .value(p.getValue())
                            .startDate(p.getStartDate())
                            .endDate(p.getEndDate())
                            .build();
                })
                .toList();
    }

    @Override
    public PromotionDTO convertToDTO(Promotion p) {
        List<PromotionDTO.ServiceInfo> serviceInfos = p.getServices().stream()
                .map(service -> new PromotionDTO.ServiceInfo(service.getId(), service.getName()))
                .collect(Collectors.toList());
                
        return PromotionDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .benefitType(p.getBenefitType().name())
                .status(p.getStatus().name())
                .services(serviceInfos)
                .value(p.getValue())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .build();
    }

    private void validateAndSetStatus(Promotion promotion) {
        LocalDateTime now = LocalDateTime.now();
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        System.out.println("\n🔍 Validating new promotion");
        System.out.println("Current time: " + now.format(formatter));
        System.out.println("Submitted start date: " + (promotion.getStartDate() != null ? promotion.getStartDate().format(formatter) : "N/A"));
        System.out.println("Submitted end date: " + (promotion.getEndDate() != null ? promotion.getEndDate().format(formatter) : "N/A"));
        
        // Osnovna validacija
        if (promotion.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        
        if (promotion.getEndDate() != null) {
            if (promotion.getEndDate().isBefore(promotion.getStartDate()) || 
                promotion.getEndDate().isEqual(promotion.getStartDate())) {
                throw new IllegalArgumentException(
                    "End date (" + promotion.getEndDate().format(formatter) + ") " +
                    "must be after start date (" + promotion.getStartDate().format(formatter) + ")"
                );
            }
        }
        
        // Postavljanje inicijalnog statusa
        if (promotion.getStatus() == null) {
            if (now.isAfter(promotion.getStartDate()) || now.isEqual(promotion.getStartDate())) {
                System.out.println("🟢 Start time has already passed - Setting status to ACTIVE");
                promotion.setStatus(Status.ACTIVE);
            } else {
                System.out.println("⏳ Start time is in future - Setting status to PENDING");
                promotion.setStatus(Status.PENDING);
                
                // Ispiši za koliko vremena će se aktivirati
                long minutesUntilStart = java.time.Duration.between(now, promotion.getStartDate()).toMinutes();
                System.out.println("   Will activate in: " + minutesUntilStart + " minutes");
            }
        }
        
        System.out.println("✅ Validation complete - Status set to: " + promotion.getStatus());
        if (promotion.getEndDate() != null) {
            long totalDuration = java.time.Duration.between(promotion.getStartDate(), promotion.getEndDate()).toMinutes();
            System.out.println("📊 Total promotion duration: " + totalDuration + " minutes\n");
        }
    }

    @Override
    public void updatePromotionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        System.out.println("\n🕒 Checking promotions at: " + now.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        getAllPromotions().forEach(promotion -> {
            Status oldStatus = promotion.getStatus();
            LocalDateTime startDate = promotion.getStartDate();
            LocalDateTime endDate = promotion.getEndDate();
            
            System.out.println("\n📦 Checking promotion: " + promotion.getName());
            System.out.println("ID: " + promotion.getId());
            System.out.println("Current status: " + promotion.getStatus());
            System.out.println("Start date: " + (startDate != null ? startDate.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "N/A"));
            System.out.println("End date: " + (endDate != null ? endDate.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "N/A"));
            
            boolean statusChanged = false;
            
            // Proveri PENDING promocije
            if (promotion.getStatus() == Status.PENDING && startDate != null) {
                if (now.isEqual(startDate) || now.isAfter(startDate)) {
                    System.out.println("⭐ ACTIVATING promotion");
                    promotion.setStatus(Status.ACTIVE);
                    statusChanged = true;
                } else {
                    long minutesUntilStart = java.time.Duration.between(now, startDate).toMinutes();
                    System.out.println("⏳ Promotion will activate in " + minutesUntilStart + " minutes");
                }
            }
            
            // Proveri ACTIVE promocije
            if (promotion.getStatus() == Status.ACTIVE && endDate != null) {
                if (now.isEqual(endDate) || now.isAfter(endDate)) {
                    System.out.println("🔚 EXPIRING promotion");
                    promotion.setStatus(Status.EXPIRED);
                    statusChanged = true;
                } else {
                    long minutesUntilEnd = java.time.Duration.between(now, endDate).toMinutes();
                    System.out.println("⌛ Promotion will expire in " + minutesUntilEnd + " minutes");
                }
            }
            
            if (statusChanged) {
                System.out.println("🔄 Status changing from " + oldStatus + " to " + promotion.getStatus());
                
                try {
                    // Prvo sačuvaj novi status u bazi
                    promotion = repo.save(promotion);
                    System.out.println("✅ Successfully saved promotion with new status: " + promotion.getStatus());
                    
                    // Zatim ažuriraj cenovnike
                    if (promotion.getStatus() == Status.ACTIVE) {
                        System.out.println("📋 Applying promotion to price lists");
                        promotionalPricingService.applyPromotionToAllPriceLists(promotion.getId());
                    } else if (oldStatus == Status.ACTIVE) {
                        System.out.println("🗑 Removing promotion from price lists");
                        promotionalPricingService.removePromotionFromPriceLists(promotion.getId());
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error updating promotion status: " + e.getMessage());
                    e.printStackTrace(); // Dodajemo stack trace za bolje debugovanje
                }
            }
        });
        
        System.out.println("\n✨ Finished checking all promotions\n");
    }

    @Override
    public void applyPromotionToPriceLists(Long promotionId) {
        promotionalPricingService.applyPromotionToAllPriceLists(promotionId);
        repo.saveAll(getAllPromotions());
    }

    @Override
    public void applyPromotionToAllPriceLists(Long promotionId) {
        promotionalPricingService.applyPromotionToAllPriceLists(promotionId);
    }

    @Override
    public Promotion activatePromotion(Long id) {
        return repo.findById(id)
                .map(promotion -> {
                    promotion.setStatus(Status.ACTIVE);
                    Promotion saved = repo.save(promotion);
                    promotionalPricingService.applyPromotionToAllPriceLists(id);
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + id));
    }

    @Override
    public Promotion deactivatePromotion(Long id) {
        return repo.findById(id)
                .map(promotion -> {
                    // Set status to INACTIVE
                    promotion.setStatus(Status.INACTIVE);
                    Promotion saved = repo.save(promotion);
                    
                    // Handle deactivation and apply next best promotion if available
                    handlePromotionDeactivation(id);
                    
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + id));
    }

    private void handlePromotionDeactivation(Long promotionId) {
        // First, remove the current promotion's prices
        promotionalPricingService.removePromotionFromPriceLists(promotionId);

        // Get the deactivated promotion to find its services
        Promotion deactivatedPromotion = repo.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + promotionId));

        // Find and apply the next best active promotion for each service
        deactivatedPromotion.getServices().forEach(service -> {
            // Find all active promotions for this service
            List<Promotion> activePromotions = repo.findAll().stream()
                    .filter(p -> p.getStatus() == Status.ACTIVE)
                    .filter(p -> p.getServices().contains(service))
                    .collect(Collectors.toList());

            // If there are any active promotions, apply the one with the best discount
            if (!activePromotions.isEmpty()) {
                // Sort by discount value (assuming higher value means better discount)
                Promotion bestPromotion = activePromotions.stream()
                        .max((p1, p2) -> p1.getValue().compareTo(p2.getValue()))
                        .orElse(null);

                if (bestPromotion != null) {
                    promotionalPricingService.applyPromotionToAllPriceLists(bestPromotion.getId());
                }
            }
        });
    }
}
