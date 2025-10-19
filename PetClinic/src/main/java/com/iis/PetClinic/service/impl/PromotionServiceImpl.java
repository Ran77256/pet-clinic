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

    private void validateAndSetStatus(Promotion promotion) {
        LocalDateTime now = LocalDateTime.now();
        
        // Ako je startDate u budućnosti
        if (promotion.getStartDate().isAfter(now)) {
            promotion.setStatus(Status.PENDING);
        }
        // Ako je endDate u prošlosti
        else if (promotion.getEndDate() != null && promotion.getEndDate().isBefore(now)) {
            promotion.setStatus(Status.EXPIRED);
        }
        // Ako je u aktivnom periodu
        else {
            promotion.setStatus(Status.ACTIVE);
        }
    }

    @Override
    public void updatePromotionStatuses() {
        getAllPromotions().forEach(promotion -> {
            Status oldStatus = promotion.getStatus();
            validateAndSetStatus(promotion);
            
            // Ako se status promenio u ACTIVE, primeni promociju
            if (oldStatus != Status.ACTIVE && promotion.getStatus() == Status.ACTIVE) {
                promotionalPricingService.applyPromotionToAllPriceLists(promotion.getId());
            }
            // Ako se status promenio iz ACTIVE u nešto drugo, ukloni promociju
            else if (oldStatus == Status.ACTIVE && promotion.getStatus() != Status.ACTIVE) {
                promotionalPricingService.removePromotionFromPriceLists(promotion.getId());
            }
            
            repo.save(promotion);
        });
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
                    return repo.save(promotion);
                })
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + id));
    }

    @Override
    public Promotion deactivatePromotion(Long id) {
        return repo.findById(id)
                .map(promotion -> {
                    validateAndSetStatus(promotion); // Ovo će postaviti odgovarajući status na osnovu datuma
                    return repo.save(promotion);
                })
                .orElseThrow(() -> new RuntimeException("Promotion not found with id " + id));
    }
}
